// Need code for detecting little-to-no movement
/*
import { useBarometerStable } from "./useBarometer";
import { useAccelerometerHold } from "./useAccelerometerStable";
import { useAngleFromGyro } from "./useGyro";

export function useFall(){

    const acceleration = useAccelerometerHold();
    const gyro = useAngleFromGyro();
    const baro = useBarometerStable();

    if (gyro?.t > 300 && acceleration.g?.mag < 1 && baro.relAltM > 0){
        return {acceleration, gyro, baro, true};
    }
}*/

// src/hooks/sensors/useFall.ts
import { useEffect, useRef, useState } from "react";
import { useBarometerStable } from "./useBarometer";
import { useAccelerometerHold } from "./useAccelerometerStable";
import { useAngleFromGyro } from "./useGyro";

type FallState = "idle" | "possible" | "confirmed" | "post";
type FallEvent = {
  t: number;
  reason: string;
  accelMin?: number;
  accelPeak?: number;
  gyroPeakDeg?: number;
  baroDeltaM?: number;
  raw?: any;
};

/**
 * Minimal, conservative fall detector that works with your existing useBarometerStable.
 * Keep thresholds conservative, then tune with real-device logs.
 */
export function useFall(opts?: {
  freeFallG?: number;       // accel mag < freeFallG (assumes accel.g.mag in g)
  impactG?: number;         // accel peak > impactG (g) — or convert if accel in m/s^2
  gyroDegS?: number;        // deg/s rotation spike
  baroDescendM?: number;    // meters (positive = descent)
  confirmWindowMs?: number;
  postStillMs?: number;
}) {
  const {
    freeFallG = 0.6,        // candidate: <0.6 g
    impactG = 2.0,          // impact: >2.0 g (adjust to your device)
    gyroDegS = 200,         // rotation spike
    baroDescendM = 0.05,    // ~5 cm descent
    confirmWindowMs = 1500,
    postStillMs = 1200,
  } = opts ?? {};

  const accel = useAccelerometerHold(); // expects accel.g.mag and optional accel.smoothedMag
  const gyro = useAngleFromGyro();      // expects gyro.omegaDegMag (deg/s) or at least omegaRad
  const baro = useBarometerStable();    // relAltM (m) and frozen flag

  const [fallState, setFallState] = useState<FallState>("idle");
  const [fallDetected, setFallDetected] = useState(false);
  const [lastEvent, setLastEvent] = useState<FallEvent | null>(null);

  // tiny rolling buffers (refs to avoid re-renders)
  const accelBuf = useRef<number[]>([]);
  const gyroBuf = useRef<number[]>([]);
  const baroBuf = useRef<number[]>([]); // {t, v}

  const tPossible = useRef<number | null>(null);
  const tImpact = useRef<number | null>(null);

  // helpers to safely read fields
  const currAccel = () => (typeof accel?.g?.mag === "number" ? accel.g.mag : null);
  const currAccelSmoothed = () => (typeof accel?.smoothedMag === "number" ? accel.smoothedMag : currAccel());
  const currGyroDeg = () => (typeof gyro?.omegaDegMag === "number" ? gyro.omegaDegMag : 0);
  const currBaroAlt = () => (typeof baro?.relAltM === "number" ? baro.relAltM : null);

  useEffect(() => {
    const now = Date.now();

    // push current samples into buffers
    const a = currAccel();
    if (typeof a === "number") {
      accelBuf.current.push(a);
      if (accelBuf.current.length > 200) accelBuf.current.shift();
    }

    const g = currGyroDeg();
    if (typeof g === "number") {
      gyroBuf.current.push(g);
      if (gyroBuf.current.length > 200) gyroBuf.current.shift();
    }

    const alt = currBaroAlt();
    if (typeof alt === "number") {
      baroBuf.current.push({ t: now, v: alt } as any);
      if (baroBuf.current.length > 200) baroBuf.current.shift();
    }

    // compute simple window metrics
    const minA = accelBuf.current.length ? Math.min(...accelBuf.current) : null;
    const maxA = accelBuf.current.length ? Math.max(...accelBuf.current) : null;
    const maxG = gyroBuf.current.length ? Math.max(...gyroBuf.current) : null;

    // short baro delta: latest - mean(recent)
    let baroDelta: number | null = null;
    if (baroBuf.current.length >= 2) {
      const recent = baroBuf.current.slice(-8).map((x: any) => x.v);
      const meanRecent = recent.reduce((s: number, v: number) => s + v, 0) / recent.length;
      const latest = baroBuf.current[baroBuf.current.length - 1].v;
      baroDelta = meanRecent - latest; // positive => descended
    }

    // detection booleans
    const freeFall = minA !== null && minA < freeFallG;
    const impact = maxA !== null && maxA > impactG;
    const rotationSpike = maxG !== null && maxG > gyroDegS;
    const baroDescend = baroDelta !== null && baroDelta > baroDescendM;

    // treat barometer as optional corroboration if frozen
    const baroAvailable = !baro?.frozen && baroDelta != null;

    // --- simple state machine ---
    if (fallState === "idle") {
      if (freeFall) {
        tPossible.current = now;
        setFallState("possible");
      }
    } else if (fallState === "possible") {
      // require impact within confirmWindowMs
      if (impact && tPossible.current && now - tPossible.current < confirmWindowMs) {
        const corroborated = rotationSpike || (baroAvailable && baroDescend);
        // if barometer frozen, allow accel+gyro only
        if (corroborated || !baroAvailable) {
          tImpact.current = now;
          setFallState("confirmed");
          setLastEvent({
            t: now,
            reason: "impact_after_freefall",
            accelMin: minA ?? undefined,
            accelPeak: maxA ?? undefined,
            gyroPeakDeg: maxG ?? undefined,
            baroDeltaM: baroDelta ?? undefined,
            raw: {
              accelBuf: accelBuf.current.slice(),
              gyroBuf: gyroBuf.current.slice(),
              baroBuf: baroBuf.current.slice(),
            },
          });
        } else {
          // no corroboration → wait until timeout to reset
          if (tPossible.current && now - tPossible.current >= confirmWindowMs) {
            tPossible.current = null;
            setFallState("idle");
          }
        }
      } else {
        // timed out without impact
        if (tPossible.current && now - tPossible.current >= confirmWindowMs) {
          tPossible.current = null;
          setFallState("idle");
        }
      }
    } else if (fallState === "confirmed") {
      // require short post-impact stillness before finalizing
      const smoothed = currAccelSmoothed() ?? currAccel() ?? 0;
      const gyroNow = currGyroDeg() ?? 0;
      const still = smoothed < (freeFallG + 0.6) && gyroNow < 12;

      if (still && tImpact.current && now - tImpact.current >= postStillMs) {
        setFallDetected(true);
        setFallState("post");
        setLastEvent((ev) => ({
          ...(ev ?? { t: now }),
          t: now,
          reason: "fall_confirmed",
          accelPeak: maxA ?? undefined,
          gyroPeakDeg: maxG ?? undefined,
          baroDeltaM: baroDelta ?? undefined,
        }));
      }

      // if too long without stillness, reset
      if (tImpact.current && now - tImpact.current > 10000) {
        tPossible.current = null;
        tImpact.current = null;
        setFallState("idle");
      }
    } else if (fallState === "post") {
      // keep flag true briefly, then reset so next events can be detected
      if (tImpact.current && now - tImpact.current > 5000) {
        setFallDetected(false);
        accelBuf.current = [];
        gyroBuf.current = [];
        baroBuf.current = [];
        tPossible.current = null;
        tImpact.current = null;
        setFallState("idle");
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accel?.g?.mag, accel?.smoothedMag, gyro?.omegaDegMag, gyro?.omegaRad, gyro?.angle, baro?.relAltM, baro?.frozen]);

  const reset = () => {
    setFallDetected(false);
    setFallState("idle");
    setLastEvent(null);
    accelBuf.current = [];
    gyroBuf.current = [];
    baroBuf.current = [];
    tPossible.current = null;
    tImpact.current = null;
  };

  return { fallDetected, fallState, lastEvent, reset };
}
