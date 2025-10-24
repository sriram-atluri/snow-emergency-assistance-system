import { Barometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

export type BaroStable = {
    supported: boolean | null;   // null while checking
    pressureHpa: number | null;  // smoothed pressure (hPa)
    relAltM: number | null;      // relative altitude (m) from baseline
    iosRelAltM?: number | null;  // iOS-only CoreMotion relative altitude, if provided
    frozen: boolean;             // UI is currently frozen (held)
    zero: () => void;            // set baseline to current reading
    lock: () => void;            // force freeze
    unlock: () => void;          // force unfreeze
  };
  
  type Opts = {
    hz?: number;            // sensor sample rate
    emitHz?: number;        // UI update rate
    alpha?: number;         // EMA smoothing 0..1 (lower=smoother)
    deadbandHpa?: number;   // ignore tiny pressure changes (hPa)
    stillHpa?: number;      // |ΔP| below this = “still”
    stillHoldMs?: number;   // how long to be still before freezing
    unfreezeHpa?: number;   // |ΔP| above this breaks the freeze
  };

export function useBarometerStable(opts: Opts = {}): BaroStable {

    const {
        hz = 5,
        emitHz = 2,
        alpha = 0.2,
        deadbandHpa = 0.02,  // ~0.02 hPa ≈ ~0.17 m
        stillHpa = 0.03,
        stillHoldMs = 1200,
        unfreezeHpa = 0.06,
      } = opts;

      const [supported, setSupported] = useState<boolean | null>(null);
      const [pressureHpa, setPressureHpa] = useState<number | null>(null);
      const [relAltM, setRelAltM] = useState<number | null>(null);
      const [iosRelAltM, setIosRelAltM] = useState<number | null>(null);
      const [frozen, setFrozen] = useState<boolean>(false);

      // smoothing / baseline / timing
      const ema = useRef<number | null>(null);
      const baselineHpa = useRef<number | null>(null);
      const lastEmit = useRef<number>(0);

    // stillness detection
     const stillSince = useRef<number | null>(null);
     const freezeAnchor = useRef<number | null>(null); // pressure at time of freeze (to detect movement)

    const altitudeFrom = (pHpa: number, p0Hpa: number) => {
    // Δh = 44330*(1 - (P/P0)^(1/5.255))
      const ratio = Math.max(1e-6, pHpa / p0Hpa);
      return 44330 * (1 - Math.pow(ratio, 1 / 5.255));
    };

  const zero = () => {
    if (pressureHpa != null) {
      baselineHpa.current = pressureHpa;
      setRelAltM(0);
    }
  };

  const lock = () => {
    if (!frozen) {
      freezeAnchor.current = pressureHpa ?? ema.current;
      setFrozen(true);
    }
  };

  const unlock = () => {
    stillSince.current = null;
    freezeAnchor.current = null;
    setFrozen(false);
  };

    useEffect(() => {

    let sub: ReturnType<typeof Barometer.addListener> | null = null;


    Barometer.isAvailableAsync().then(setSupported);
    Barometer.setUpdateInterval(Math.max(50, 1000 / hz))

    sub = Barometer.addListener((data: any) => {
        const now = Date.now();

      // Normalize to hPa across platforms
      let p = Number(data?.pressure);
      if (!Number.isFinite(p)) return;
      const pHpa = p > 2000 ? p / 100 : p; // (Pa → hPa) heuristic

      if (typeof data?.relativeAltitude === "number") {
        setIosRelAltM(data.relativeAltitude);
      }

      // EMA smoothing
      ema.current = ema.current == null ? pHpa : alpha * pHpa + (1 - alpha) * ema.current;

      // Stillness / freeze logic
      const anchor = freezeAnchor.current ?? ema.current;
      const deltaFromAnchor = Math.abs((ema.current ?? 0) - (anchor ?? 0));

      if (!frozen) {
        // Count how long we've been within stillness threshold
        if (pressureHpa != null && Math.abs(ema.current - pressureHpa) < stillHpa) {
          if (stillSince.current == null) stillSince.current = now;
          if (now - (stillSince.current ?? 0) >= stillHoldMs) {
            // Freeze because we've been still long enough
            freezeAnchor.current = ema.current;
            setFrozen(true);
          }
        } else {
          stillSince.current = null;
        }
      } else {
        // If frozen, unfreeze when pressure moves enough
        if (deltaFromAnchor > unfreezeHpa) {
          unlock();
        }
      }

      // Throttle UI updates
      const minInterval = 1000 / emitHz;
      if (now - lastEmit.current < minInterval) return;

      // If frozen, do not update UI values (keeps them steady)
      if (frozen) return;

      // Deadband on pressure changes
      if (pressureHpa != null && Math.abs((ema.current ?? 0) - pressureHpa) < deadbandHpa) return;

      lastEmit.current = now;

      // Update smoothed pressure
      setPressureHpa(ema.current!);

      // Initialize baseline once
      if (baselineHpa.current == null) baselineHpa.current = ema.current!;

      // Update relative altitude from baseline
      if (baselineHpa.current != null) {
        const dH = altitudeFrom(ema.current!, baselineHpa.current);
        setRelAltM(dH);
      }
        
            }
        );

       return () => sub?.remove();
    }, [hz, emitHz, alpha, deadbandHpa, stillHpa, stillHoldMs, unfreezeHpa, frozen]);
    

    return { supported, pressureHpa, relAltM, iosRelAltM, frozen, zero, lock, unlock };
}