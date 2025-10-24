import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

const G = 9.80665;

export type AccelStable = {
  supported: boolean | null;
  g: { x: number; y: number; z: number; mag: number } | null;        // includes gravity (g)
  linear: { x: number; y: number; z: number; mag: number } | null;   // gravity-removed (m/s²)
  frozen: boolean;
  lock: () => void;
  unlock: () => void;
};

type Opts = {
  hz?: number;            // sensor sample rate
  emitHz?: number;        // UI update rate
  alpha?: number;         // EMA for raw accel (0..1)
  gravityAlpha?: number;  // LPF for gravity estimate (0..1)
  deadbandG?: number;     // ignore tiny raw changes (g)
  stillLinear?: number;   // |linear| < this (m/s²) counts as "still"
  holdMs?: number;        // how long "still" before freezing
  unfreezeLinear?: number;// |linear| > this (m/s²) breaks freeze (hysteresis)
};

export function useAccelerometerHold(opts: Opts = {}): AccelStable {
  const {
    hz = 30,
    emitHz = 10,
    alpha = 0.25,
    gravityAlpha = 0.10,
    deadbandG = 0.01,
    stillLinear = 0.15,   // ~0.015 g
    holdMs = 1200,
    unfreezeLinear = 0.30 // > stillLinear for hysteresis
  } = opts;

  const [supported, setSupported] = useState<boolean | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [gState, setGState] = useState<AccelStable["g"]>(null);
  const [linState, setLinState] = useState<AccelStable["linear"]>(null);

  const ema = useRef<{ x: number; y: number; z: number } | null>(null);   // smoothed raw (g)
  const grav = useRef<{ x: number; y: number; z: number } | null>(null);  // gravity est. (g)
  const lastEmit = useRef(0);
  const stillSince = useRef<number | null>(null);

  const lock = () => setFrozen(true);
  const unlock = () => { stillSince.current = null; setFrozen(false); };

  useEffect(() => {
    Accelerometer.isAvailableAsync().then(setSupported).catch(() => setSupported(null));
    Accelerometer.setUpdateInterval(Math.max(5, Math.round(1000 / hz)));

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();

      // EMA for raw (g)
      if (!ema.current) ema.current = { x, y, z };
      else {
        ema.current = {
          x: alpha * x + (1 - alpha) * ema.current.x,
          y: alpha * y + (1 - alpha) * ema.current.y,
          z: alpha * z + (1 - alpha) * ema.current.z,
        };
      }

      // Gravity LPF (g)
      if (!grav.current) grav.current = { ...ema.current };
      else {
        grav.current = {
          x: gravityAlpha * ema.current.x + (1 - gravityAlpha) * grav.current.x,
          y: gravityAlpha * ema.current.y + (1 - gravityAlpha) * grav.current.y,
          z: gravityAlpha * ema.current.z + (1 - gravityAlpha) * grav.current.z,
        };
      }

      // Linear accel (m/s²)
      const lx = (ema.current.x - grav.current.x) * G;
      const ly = (ema.current.y - grav.current.y) * G;
      const lz = (ema.current.z - grav.current.z) * G;
      const lmag = Math.hypot(lx, ly, lz);

      // Freeze logic (auto)
      if (!frozen) {
        if (lmag < stillLinear) {
          if (stillSince.current == null) stillSince.current = now;
          if (now - stillSince.current >= holdMs) setFrozen(true);
        } else {
          stillSince.current = null;
        }
      } else {
        if (lmag > unfreezeLinear) unlock();
      }

      // Throttle + deadband + skip when frozen
      const minInterval = 1000 / emitHz;
      if (now - lastEmit.current < minInterval) return;
      if (frozen) return;

      const prev = gState;
      const gx = ema.current.x, gy = ema.current.y, gz = ema.current.z;
      if (
        prev &&
        Math.abs(gx - prev.x) < deadbandG &&
        Math.abs(gy - prev.y) < deadbandG &&
        Math.abs(gz - prev.z) < deadbandG
      ) return;

      lastEmit.current = now;

      const gmag = Math.hypot(gx, gy, gz);
      setGState({ x: gx, y: gy, z: gz, mag: gmag });
      setLinState({ x: lx, y: ly, z: lz, mag: lmag });
    });

    return () => sub.remove();
  }, [hz, emitHz, alpha, gravityAlpha, deadbandG, stillLinear, holdMs, unfreezeLinear, frozen]);

  return { supported, g: gState, linear: linState, frozen, lock, unlock };
}
