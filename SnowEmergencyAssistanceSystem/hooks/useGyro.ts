
import { Gyroscope } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

export type AngleDeg = { x: number; y: number; z: number; t: number };

type Opts = {
  hz?: number;
  emitHz?: number;
  alpha?: number;
  deadbandDeg?: number;
  roundToDeg?: number;
  stillOmega?: number;     // rad/s
  stillHoldMs?: number;
};

export function useAngleFromGyro(opts: Opts = {}) {
  const {
    hz = 30,
    emitHz = 8,
    alpha = 0.25,
    deadbandDeg = 0.2,
    roundToDeg = 0.5,
    stillOmega = 0.02,     // ≈ 1.15°/s
    stillHoldMs = 1000,
  } = opts;

  const [angle, setAngle] = useState<AngleDeg | null>(null);
  // const [angle, setAngle] = useState<AngleDeg | null>(null);
  const [frozenState, setFrozenState] = useState<boolean>(false);

  const ema = useRef<{ x: number; y: number; z: number } | null>(null); // rad/s
  const theta = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const last = useRef<number | null>(null);
  const lastEmit = useRef<number>(0);
  const stillSince = useRef<number | null>(null);
  const frozen = useRef<boolean>(false);

  useEffect(() => {
    Gyroscope.setUpdateInterval(Math.max(5, Math.round(1000 / hz)));
    const sub = Gyroscope.addListener(({ x, y, z }) => {
      const now = Date.now();

      // 1) EMA on angular velocity (rad/s)
      if (!ema.current) ema.current = { x, y, z };
      else {
        ema.current = {
          x: alpha * x + (1 - alpha) * ema.current.x,
          y: alpha * y + (1 - alpha) * ema.current.y,
          z: alpha * z + (1 - alpha) * ema.current.z,
        };
      }

      // compute magnitude safely (ema.current guaranteed above)
      const mag = ema.current ? Math.hypot(ema.current.x, ema.current.y, ema.current.z) : 0;

      // 2) Detect stillness → freeze integration after hold
      if (mag < stillOmega) {
        if (stillSince.current == null) stillSince.current = now;
        if (!frozen.current && now - (stillSince.current ?? now) >= stillHoldMs) {
          frozen.current = true;
          setFrozenState(true);
        }
      } else {
        stillSince.current = null;
        if (frozen.current) {
          frozen.current = false;
          setFrozenState(false);
        }
      }

      // 3) Integrate ω → θ (degrees), unless frozen
      if (last.current == null) {
        last.current = now;
        return;
      }
      const dt = Math.max(0, (now - last.current) / 1000); // seconds
      last.current = now;

      if (!frozen.current && ema.current) {
        const rad2deg = 180 / Math.PI;
        theta.current.x += ema.current.x * dt * rad2deg;
        theta.current.y += ema.current.y * dt * rad2deg;
        theta.current.z += ema.current.z * dt * rad2deg;

        // optional: clamp theta to avoid runaway drift over long runs
        const clamp = (v: number) => Math.max(-3600, Math.min(3600, v));
        theta.current.x = clamp(theta.current.x);
        theta.current.y = clamp(theta.current.y);
        theta.current.z = clamp(theta.current.z);
      }

      // 4) Throttle + deadband + rounding before setState
      const minInterval = 1000 / emitHz;
      if (now - lastEmit.current >= minInterval) {
        const prev = angle;
        const round = (v: number) => Math.round(v / roundToDeg) * roundToDeg;

        const rx = round(theta.current.x);
        const ry = round(theta.current.y);
        const rz = round(theta.current.z);

        const changed =
          !prev ||
          Math.abs(rx - prev.x) > deadbandDeg ||
          Math.abs(ry - prev.y) > deadbandDeg ||
          Math.abs(rz - prev.z) > deadbandDeg;

        if (changed) {
          lastEmit.current = now;
          setAngle({ x: rx, y: ry, z: rz, t: now });
        }
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hz, emitHz, alpha, deadbandDeg, roundToDeg, stillOmega, stillHoldMs]);

  // expose the EMA omega and its magnitude in deg/s for easy use by fall detection
  const omegaRad = ema.current ? { ...ema.current } : null;
  const omegaDegMag = omegaRad ? Math.hypot(omegaRad.x, omegaRad.y, omegaRad.z) * (180 / Math.PI) : 0;

  return { angle, omegaRad, omegaDegMag, frozen: frozenState } as const;
}

