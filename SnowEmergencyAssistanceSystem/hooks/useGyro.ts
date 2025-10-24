/*import { useEffect, useRef, useState } from "react";
import { Gyroscope } from "expo-sensors";

export interface GyroSample { x:number; y:number; z:number; t:number; }

export function useGyro(hz = 60) {
    const [s, setS] = useState<GyroSample|null>(null);
    const sub = useRef<ReturnType<typeof Gyroscope.addListener>|null>(null);
  
    useEffect(() => {
      Gyroscope.setUpdateInterval(Math.max(1, Math.round(1000 / hz)));
      sub.current = Gyroscope.addListener(({ x, y, z }) =>
        setS({ x, y, z, t: Date.now() })
      );
      return () => sub.current?.remove();
    }, [hz]);
  
    return s; // radians/sec
  }*/
  import { Gyroscope } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

export type AngleDeg = { x: number; y: number; z: number; t: number };

type Opts = {
  hz?: number;            // sensor sample rate
  emitHz?: number;        // UI update rate
  alpha?: number;         // EMA for ω (0..1) lower = smoother
  deadbandDeg?: number;   // ignore tiny angle changes (deg)
  roundToDeg?: number;    // round display to nearest N degrees
  stillOmega?: number;    // |ω| below this (rad/s) = "still"
  stillHoldMs?: number;   // how long ω must be still to freeze
};

export function useAngleFromGyro(opts: Opts = {}) {
  const {
    hz = 30,
    emitHz = 8,
    alpha = 0.25,
    deadbandDeg = 0.2,
    roundToDeg = 0.5,
    stillOmega = 0.02,     // ≈ 1.1°/s
    stillHoldMs = 1000,
  } = opts;

  const [angle, setAngle] = useState<AngleDeg | null>(null);

  const ema = useRef<{ x: number; y: number; z: number } | null>(null);
  const theta = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const last = useRef<{ t: number } | null>(null);
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

      // 2) Detect stillness → freeze integration after hold
      const mag = Math.hypot(ema.current.x, ema.current.y, ema.current.z);
      if (mag < stillOmega) {
        if (stillSince.current == null) stillSince.current = now;
        if (!frozen.current && now - (stillSince.current ?? now) >= stillHoldMs) {
          frozen.current = true;
        }
      } else {
        stillSince.current = null;
        frozen.current = false;
      }

      // 3) Integrate ω → θ (degrees), unless frozen
      if (last.current == null) {
        last.current = { t: now };
        return;
      }
      const dt = Math.max(0, (now - last.current.t) / 1000); // seconds
      last.current.t = now;

      if (!frozen.current) {
        const rad2deg = 180 / Math.PI;
        theta.current.x += ema.current.x * dt * rad2deg;
        theta.current.y += ema.current.y * dt * rad2deg;
        theta.current.z += ema.current.z * dt * rad2deg;
      }

      // 4) Throttle + deadband + rounding before setState
      const minInterval = 1000 / emitHz;
      if (now - lastEmit.current >= minInterval) {
        const prev = angle;
        const round = (v: number) =>
          Math.round(v / roundToDeg) * roundToDeg;

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

  return angle;
}
