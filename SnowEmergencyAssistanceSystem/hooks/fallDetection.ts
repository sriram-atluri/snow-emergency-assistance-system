// src/hooks/fallDetection.ts 
// FINAL: Timed State Machine - Realistic sensor thresholds

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

// --- Configuration Constants ---
const UPDATE_INTERVAL_MS = 50; 
const POST_IMPACT_STILLNESS_LINEAR_MS2 = 0.5; // Stillness threshold in m/s² (linear mag)

/**
 * Reliable fall detector using a timed state machine based on realistic sensor thresholds.
 * 
 */
export function useFall(opts?: {
  freeFallG?: number;       // accel mag < freeFallG (g)
  impactG?: number;         // accel peak > impactG (g)
  gyroDegS?: number;        // deg/s rotation spike
  baroDescendM?: number;    // meters (positive = descent)
  confirmWindowMs?: number;
  postStillMs?: number;
}) {
  const {
    freeFallG = 0.6,        // candidate: <0.6 g
    impactG = 2.0,          // impact: >2.0 g 
    gyroDegS = 200,         // rotation spike
    baroDescendM = 0.05,    // ~5 cm descent
    confirmWindowMs = 1500,
    postStillMs = 1200,
  } = opts ?? {};

  const accel = useAccelerometerHold(); 
  const gyro = useAngleFromGyro();      
  const baro = useBarometerStable();    

  const [fallState, setFallState] = useState<FallState>("idle");
  const [fallDetected, setFallDetected] = useState(false);
  const [lastEvent, setLastEvent] = useState<FallEvent | null>(null);

  const accelBuf = useRef<number[]>([]);
  const gyroBuf = useRef<number[]>([]);
  const baroBuf = useRef<number[]>([]); 

  const tPossible = useRef<number | null>(null);
  const tImpact = useRef<number | null>(null);
  const tStillness = useRef<number | null>(null); 

  // helpers to safely read fields
  const currAccel = () => (typeof accel?.g?.mag === "number" ? accel.g.mag : null);
  const currLinearMag = () => (typeof accel?.linear?.mag === "number" ? accel.linear.mag : 100); 
  const currGyroDeg = () => (typeof gyro?.omegaDegMag === "number" ? gyro.omegaDegMag : 0);
  const currBaroAlt = () => (typeof baro?.relAltM === "number" ? baro.relAltM : null);


  useEffect(() => {
    // Use setInterval to ensure constant evaluation 
    const intervalId = setInterval(() => {
        const now = Date.now();

        // 1. Update Buffers
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
        
        // 2. Compute Metrics
        const minA = accelBuf.current.length ? Math.min(...accelBuf.current) : null;
        const maxA = accelBuf.current.length ? Math.max(...accelBuf.current) : null;
        const maxG = gyroBuf.current.length ? Math.max(...gyroBuf.current) : null;

        let baroDelta: number | null = null;
        if (baroBuf.current.length >= 2) {
            const recent = baroBuf.current.slice(-10).map((x: any) => x.v);
            const meanRecent = recent.reduce((s: number, v: number) => s + v, 0) / recent.length;
            const latest = baroBuf.current[baroBuf.current.length - 1].v;
            baroDelta = meanRecent - latest; 
        }

        // 3. Detection Booleans (Realistic Thresholds)
        const freeFall = minA !== null && minA < freeFallG;
        const impact = maxA !== null && maxA > impactG;
        const rotationSpike = maxG !== null && maxG > gyroDegS;
        const baroDescend = baroDelta !== null && baroDelta > baroDescendM;
        const baroAvailable = !baro?.frozen && baroDelta != null;

        // 4. Stillness Check (Post-Impact Confirmation)
        const linearMagNow = currLinearMag(); // m/s²
        const currentGyro = currGyroDeg() ?? 0;
        
        const still = linearMagNow < POST_IMPACT_STILLNESS_LINEAR_MS2 && currentGyro < 12;
        
        // --- State Machine ---
        let nextState: FallState = fallState;

        switch (fallState) {
            case "idle":
                if (freeFall) {
                    tPossible.current = now;
                    nextState = "possible";
                }
                break;

            case "possible":
                if (impact && tPossible.current && now - tPossible.current < confirmWindowMs) {
                    const corroborated = rotationSpike || (baroAvailable && baroDescend);
                    
                    if (corroborated || !baroAvailable) {
                        tImpact.current = now;
                        tStillness.current = null; 
                        nextState = "confirmed";
                        setLastEvent({
                            t: now,
                            reason: "impact_after_freefall",
                            accelMin: minA ?? undefined,
                            accelPeak: maxA ?? undefined,
                            gyroPeakDeg: maxG ?? undefined,
                            baroDeltaM: baroDelta ?? undefined,
                        });
                    }
                }
                if (tPossible.current && now - tPossible.current >= confirmWindowMs) {
                    tPossible.current = null;
                    nextState = "idle";
                }
                break;

            case "confirmed":
                // Look for stillness after impact
                if (still) {
                    if (tStillness.current == null) tStillness.current = now;
                    // Still long enough to confirm
                    if (tImpact.current && now - tStillness.current >= postStillMs) {
                        setFallDetected(true); 
                        nextState = "post";
                    }
                } else {
                    tStillness.current = null; 
                }

                // Hard timeout if stillness never achieved
                if (tImpact.current && now - tImpact.current > 10000) {
                    tPossible.current = null;
                    tImpact.current = null;
                    tStillness.current = null;
                    nextState = "idle";
                }
                break;

            case "post":
                // Keep the flag TRUE for 5 seconds, then reset
                if (tImpact.current && now - tImpact.current > 5000) {
                    setFallDetected(false); 
                    accelBuf.current = [];
                    gyroBuf.current = [];
                    baroBuf.current = [];
                    tPossible.current = null;
                    tImpact.current = null;
                    tStillness.current = null;
                    nextState = "idle";
                }
                break;
        }

        if (nextState !== fallState) {
            setFallState(nextState);
        }
    }, UPDATE_INTERVAL_MS); 

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
    
  }, [fallState, freeFallG, impactG, gyroDegS, baroDescendM, confirmWindowMs, postStillMs]);

  const reset = () => {
    setFallDetected(false);
    setFallState("idle");
    setLastEvent(null);
    accelBuf.current = [];
    gyroBuf.current = [];
    baroBuf.current = [];
    tPossible.current = null;
    tImpact.current = null;
    tStillness.current = null;
  };

  return { fallDetected, fallState, lastEvent, reset };
}