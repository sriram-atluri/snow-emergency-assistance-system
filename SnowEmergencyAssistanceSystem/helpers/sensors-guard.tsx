// src/helpers/sensors-guard.ts
import { Platform } from "react-native";
import { Accelerometer, Gyroscope, Barometer } from "expo-sensors";

function hasAddListener(m: any) {
  return m && typeof m.addListener === "function";
}

export function sensorsAvailable() {
  // if web, treat as unavailable (Expo sensors are not guaranteed on web)
  if (Platform.OS === "web") return false;
  return hasAddListener(Accelerometer) && hasAddListener(Gyroscope) && hasAddListener(Barometer);
}
