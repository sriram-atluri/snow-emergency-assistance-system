import { Image } from 'expo-image';
import { Platform, StyleSheet, Pressable } from 'react-native';
// add (or extend) this import at the top of HomeScreen / index.tsx
import React, { useEffect, useRef, useState } from "react";
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
//import { useGyro } from "@/hooks/useGyro";
import { useAngleFromGyro } from "@/hooks/useGyro";
import { useAccelerometerHold } from "@/hooks/useAccelerometerStable";
import { useBarometerStable } from "@/hooks/useBarometer"
import { useFall } from "@/hooks/fallDetection"
import { Alert, Vibration } from "react-native"; // use Vibration for haptic feedback
import { sensorsAvailable } from "@/helpers/sensors-guard";

export default function HomeScreen() {
 //const g = useGyro(60);
 const DEG = '\u00B0';

 const { logout } = useAuth();

 const ang = useAngleFromGyro({
  hz: 30, emitHz: 8, alpha: 0.25,
  roundToDeg: 0.5, deadbandDeg: 0.2,
  stillOmega: 0.02, stillHoldMs: 1200
});
const baro = useBarometerStable({
  hz: 5, emitHz: 2, alpha: 0.2,
  deadbandHpa: 0.02, stillHpa: 0.03,
  stillHoldMs: 1200, unfreezeHpa: 0.06,
});

const acc = useAccelerometerHold({
  hz: 30,        // sensor sample rate
  emitHz: 12,    // UI update rate
  alpha: 0.25,   // raw smoothing
  gravityAlpha: 0.10, // gravity LPF
  deadbandG: 0.01,
});

// inside your HomeScreen() component (after existing hooks)
const ok = sensorsAvailable();

// if sensors not available keep fall hook harmless by not calling it (or call and rely on internal guards)
const { fallDetected, fallState, lastEvent, reset: resetFall } = ok ? useFall() : { fallDetected: false, fallState: "idle", lastEvent: null, reset: () => {} };

// handle a one-time alert / action when a fall is confirmed
const lastAlert = useRef<number | null>(null);

useEffect(() => {
  if (!fallDetected) return;

  const now = Date.now();
  // avoid spamming: only alert once per 10s (tweak)
  if (lastAlert.current && now - lastAlert.current < 10000) return;
  lastAlert.current = now;

  // vibrate and show a confirmation alert
  Vibration.vibrate([200, 80, 200]); // small pattern
  Alert.alert(
    "Fall detected",
    "A probable fall was detected. Are you OK?",
    [
      { text: "I'm OK", onPress: () => resetFall(), style: "default" },
      {
        text: "Call Help",
        style: "destructive",
        onPress: () => {
          // TODO: implement call/SOS action (Linking.openURL('tel:...') or custom)
          resetFall();
        },
      },
    ],
    { cancelable: true }
  );
}, [fallDetected, resetFall]);

// 🚨 New: Handle Sign Out
const handleSignOut = async () => {
  try {
      // 🚨 ADD THIS LINE 🚨
      console.log("Sign Out Button Clicked. Attempting logout..."); 
      
      await logout(); 
      // If this line executes, the button was definitely clicked!
      
  } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Failed to sign out.");
  }
};

  return (

    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>


      <ThemedView style={{ alignItems:"center", justifyContent:"center", paddingVertical:16 }}>
        <ThemedText type="subtitle">Angles (deg)</ThemedText>
        <ThemedText>
          {/*ang ? `roll x: ${ang.x.toFixed(1)}${DEG}   pitch y: ${ang.y.toFixed(1)}${DEG}   yaw z: ${ang.z.toFixed(1)}${DEG}`
               : "Waiting…"*/}
        </ThemedText>
        <ThemedText type="default">Updates frozen when device is still.</ThemedText>
      </ThemedView>

      <ThemedView style={{ alignItems: "center", gap: 8, paddingVertical: 12 }}>
        <ThemedText type="subtitle">Accelerometer</ThemedText>

        <ThemedText>
          {acc.g ? `raw (g): x ${acc.g.x.toFixed(3)}  y ${acc.g.y.toFixed(3)}  z ${acc.g.z.toFixed(3)}  | |g| ${acc.g.mag.toFixed(3)}`
                 : "Reading…"}
        </ThemedText>

        <ThemedText>
          {acc.linear ? `linear (m/s²): x ${acc.linear.x.toFixed(2)}  y ${acc.linear.y.toFixed(2)}  z ${acc.linear.z.toFixed(2)}  |a| ${acc.linear.mag.toFixed(2)}`
                      : "Estimating…"}
        </ThemedText>

        <ThemedText type="defaultSemiBold">
          {acc.frozen ? "🔒 Held (still)" : "🟢 Live"}
        </ThemedText>

        <ThemedView style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          {acc.frozen ? (
            <Pressable onPress={acc.unlock} style={btn("#888")}><ThemedText style={{ color: "#fff" }}>Unfreeze</ThemedText></Pressable>
          ) : (
            <Pressable onPress={acc.lock} style={btn("#444")}><ThemedText style={{ color: "#fff" }}>Freeze</ThemedText></Pressable>
          )}
        </ThemedView>

      </ThemedView>

      <ThemedView style={{ gap: 8, paddingVertical: 12, alignItems: "center" }}>
        <ThemedText type="subtitle">Barometer</ThemedText>

        <ThemedText>
          {baro.supported === null
            ? "Checking sensor…"
            : baro.supported ? "Barometer available" : "Barometer not available"}
        </ThemedText>

        <ThemedText>
          {baro.pressureHpa != null ? `Pressure: ${baro.pressureHpa.toFixed(2)} hPa` : "Reading pressure…"}
        </ThemedText>

        <ThemedText>
          {baro.relAltM != null ? `ΔAltitude: ${baro.relAltM.toFixed(2)} m` : "Estimating altitude…"}
        </ThemedText>

        {baro.iosRelAltM != null && (
          <ThemedText type="default">(iOS relAlt: {baro.iosRelAltM.toFixed(2)} m)</ThemedText>
        )}

        <ThemedText type="defaultSemiBold">
          {baro.frozen ? "🔒 Held (still)" : "🟢 Live"}
        </ThemedText>

        <ThemedView style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <Pressable onPress={baro.zero} style={btnStyle("#2f95dc")}>
            <ThemedText style={{ color: "white" }}>Zero</ThemedText>
          </Pressable>
          {baro.frozen ? (
            <Pressable onPress={baro.unlock} style={btnStyle("#888")}>
              <ThemedText style={{ color: "white" }}>Unfreeze</ThemedText>
            </Pressable>
          ) : (
            <Pressable onPress={baro.lock} style={btnStyle("#444")}>
              <ThemedText style={{ color: "white" }}>Freeze</ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </ThemedView>

      // inside your ParallaxScrollView content where you render sensors:
<ThemedView style={{ alignItems: "center", paddingVertical: 12 }}>
  <ThemedText type="subtitle">Fall Detection</ThemedText>
  <ThemedText>
    {ok ? `State: ${fallState}` : "Sensors not available (no fall detection)"}
  </ThemedText>
  <ThemedText>
    {lastEvent ? `Last: ${lastEvent.reason} @ ${new Date(lastEvent.t).toLocaleTimeString()}` : "No events"}
  </ThemedText>
  <ThemedView style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
    <Pressable onPress={() => resetFall()} style={btnStyle("#666")}>
      <ThemedText style={{ color: "white" }}>Reset</ThemedText>
    </Pressable>
    <Pressable onPress={() => {
      // quick debug: unlock baro if frozen to capture baro delta for one test
      if (baro?.frozen) baro.unlock();
    }} style={btnStyle("#2f95dc")}>
      <ThemedText style={{ color: "white" }}>Unlock Baro (debug)</ThemedText>
    </Pressable>
  </ThemedView>
</ThemedView>

{/* 🚨 ADD SIGN OUT BUTTON HERE 🚨 */}
<ThemedView style={styles.signOutContainer}>
        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <ThemedText style={{ color: "white", fontWeight: 'bold' }}>Sign Out</ThemedText>
        </Pressable>
      </ThemedView>
      

    </ParallaxScrollView>
  );
}

const btn = (bg: string) => ({ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: bg });

const btnStyle = (bg: string) => ({
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 10,
  backgroundColor: bg,
});

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  signOutContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc', // Light gray separator
  },
  signOutButton: {
    backgroundColor: '#E74C3C', // Red color for destructive action
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  }
});
