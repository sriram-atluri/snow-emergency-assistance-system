// interfaces/SensorData.ts (Create this file)

import { Timestamp } from 'firebase/firestore';

// Define the shape of your sensor data objects
interface AngleData {
  x: number;
  y: number;
}

interface AccelData {
  x: number;
  y: number;
  z: number;
  mag: number;
}

interface EventDetails {
    reason: string;
    t: number;
}

// Define the final shape of the document sent to Firestore
export interface FirestoreSensorLog {
  status: string; // The fallState string (e.g., 'idle', 'fall_detected')
  isFalling: boolean;
  userId: string;
  timestamp: Timestamp;

  // Sensor Snapshots
  gyro_angle: AngleData | null;
  accel_linear: AccelData | null;
  baro_pressure: number | null | undefined;
  event_details: EventDetails | null;
}