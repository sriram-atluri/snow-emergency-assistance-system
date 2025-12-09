// firebaseService.tsx (MONOLITHIC: Fall Detection Logic Integrated)

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert, Vibration } from 'react-native';
// Note: If you want live location, you must re-add the expo-location import
// import * as Location from 'expo-location'; 

// 🛑 ALL SENSOR AND FALL DETECTION HOOKS ARE HERE 🛑
import { useAngleFromGyro } from "@/hooks/useGyro";
import { useAccelerometerHold } from "@/hooks/useAccelerometerStable";
import { useBarometerStable } from "@/hooks/useBarometer";
import { useFall } from "@/hooks/fallDetection"; // CRITICAL: Fall detection logic
// import { sensorsAvailable } from "@/helpers/sensors-guard"; // No longer directly used

// Imports functional Firebase utilities
import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from '@/firebaseConfig'; 

// --- Severity Logic Configuration ---
const SEVERITY_THRESHOLDS = {
    LOW_SERIOUSNESS_ANGLE_DEG: 15, 
    HIGH_SERIOUSNESS_ANGLE_DEG: 45, 
};
// ------------------------------------

interface LatestReportData {
    id?: string; 
    date: string;
    time: string;
    location: string;
    type: string;
    severity: string;
    angle: string;
    velocity: string;
    pressure: string;
    fileUri: string | null;
    mockContent?: string; 
    timestamp: number; 
}

interface ReportContextType {
    latestReport: LatestReportData | null;
    allReports: LatestReportData[];
    setLatestReport: (report: LatestReportData | null) => void;
    addReport: (report: LatestReportData, isTest?: boolean) => Promise<void>;
    fetchReports: () => Promise<void>;
    triggerManualSave: () => Promise<void>; 
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);
const REPORTS_COLLECTION = "fallReports"; 

// Helper function to calculate severity
const calculateSeverity = (angleRaw: number | null): string => {
    if (angleRaw === null) return "N/A";

    if (angleRaw <= SEVERITY_THRESHOLDS.LOW_SERIOUSNESS_ANGLE_DEG) {
        return "Low";
    } else if (angleRaw >= SEVERITY_THRESHOLDS.HIGH_SERIOUSNESS_ANGLE_DEG) {
        return "High";
    } else {
        return "Mid";
    }
}

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const [latestReport, setLatestReport] = useState<LatestReportData | null>(null);
    const [allReports, setAllReports] = useState<LatestReportData[]>([]);
    const [loading, setLoading] = useState(false);

    // 🛑 SENSOR AND FALL DETECTION HOOKS 🛑
    const ang = useAngleFromGyro();
    const baro = useBarometerStable();
    const acc = useAccelerometerHold();
    const { fallDetected, fallState, reset: resetFall } = useFall(); // Detection state

    // CRITICAL REF: Holds the stable report snapshot for saving after an alert resolution
    const pendingReportRef = useRef<LatestReportData | null>(null);
    const lastAlertId = useRef<string | null>(null);
    
    // NOTE: The continuous raw data logging (finalSensorData.current) logic is REMOVED
    // as it cannot be easily and correctly managed inside a Context Provider.

    // 1. FETCH REPORTS (omitted for brevity)
    const fetchReports = async () => { /* ... (omitted) ... */ };

    // 2. ADD REPORT to Firestore
    const addReport = async (report: LatestReportData, isTest: boolean = false) => {
        try {
            const reportToSave: LatestReportData = { ...report };
            if (reportToSave.mockContent === undefined) {
                delete reportToSave.mockContent;
            }
            
            await addDoc(collection(db, REPORTS_COLLECTION), reportToSave);
            await fetchReports();

        } catch (error) {
            console.error("❌ FIREBASE ERROR: Error adding report to Firestore:", error);
            Alert.alert("Database Error", "Failed to save the fall report to the cloud.");
        }
    };

    // 3. CORE SAVE FUNCTION: Finalizes the report and saves it
    // NOTE: In this architecture, this is used for both Fall resolution and Cleanup.
    const finalizeReportAndSave = async (reportToSave: LatestReportData) => {
        // Here you would add the logic to save the raw sensor log file (removed for simplicity)
        
        await addReport(reportToSave, false); // Save the report as a real one
        
        setLatestReport(null); // Clear pending report from UI/Context
        pendingReportRef.current = null; // Clear stable ref
        resetFall(); // Reset the detection state
        
        console.log(`✅ REPORT SAVED: ID ${reportToSave.id}.`);
    };


    // 🛑 EFFECT 1: FALL DETECTION SNAPSHOT 🛑
    // This watches fallDetected and takes a snapshot of the current sensor state.
    useEffect(() => {
        if (fallDetected) {
            const now = new Date();
            const reportId = `FALL-${now.getTime()}`; 

            // Robust data access for the snapshot
            const angleRaw = ang && ang.x !== undefined && ang.x !== null ? ang.x : null;
            const angleValue = angleRaw !== null ? angleRaw.toFixed(1) : 'N/A';
            const velocityValue = acc.linear && acc.linear.mag !== undefined && acc.linear.mag !== null ? acc.linear.mag.toFixed(1) : 'N/A';
            const pressureValue = baro.pressureHpa && baro.pressureHpa !== undefined && baro.pressureHpa !== null ? baro.pressureHpa.toFixed(2) : 'N/A';
            
            const severity = calculateSeverity(angleRaw);

            const fallReportSnapshot = {
                id: reportId,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                location: "Fargo, NDSU, ND (Simulated)", // Replace with live location function call if desired
                type: "Fall",
                severity: severity,
                angle: `${angleValue} deg`,
                velocity: `${velocityValue} m/s²`,
                pressure: `${pressureValue} hPa`,
                fileUri: null, 
                timestamp: now.getTime(),
            } as LatestReportData;

            // CRITICAL: Set both the Context state (for UI/Alert) AND the stable Ref copy (for final save)
            setLatestReport(fallReportSnapshot); 
            pendingReportRef.current = fallReportSnapshot;
            
            console.log(`✅ FALL DETECTED: Snapshot taken and stored in REF.`);
        }
    }, [fallDetected, ang, acc, baro, setLatestReport]);

    // 🛑 EFFECT 2: FALL ALERT HANDLER 🛑
    useEffect(() => {
        if (!latestReport || latestReport.id === lastAlertId.current) return;

        lastAlertId.current = latestReport.id;
        
        Vibration.vibrate([200, 80, 200]);

        Alert.alert(
            "Fall detected",
            "A probable fall was detected. Please confirm your status.",
            [
                { 
                    text: "I'm OK", 
                    onPress: () => { 
                        // If user confirms OK, use the stable snapshot from the Ref and save it.
                        if (pendingReportRef.current) {
                            finalizeReportAndSave(pendingReportRef.current);
                        }
                    }, 
                    style: "default" 
                },
                { 
                    text: "Call Help", 
                    style: "destructive", 
                    onPress: () => { 
                        // Save the report before calling help
                        if (pendingReportRef.current) {
                            finalizeReportAndSave(pendingReportRef.current); 
                            // Call Help Logic
                        }
                    } 
                },
            ],
            { cancelable: false } 
        );
        
    }, [latestReport]); 


    // 🛑 4. TRIGGER MANUAL SAVE (Cleanup Logic) 🛑
    const triggerManualSave = async () => {
      // If a fall was detected and the user is turning off monitoring, 
      // we treat this as the user implicitly resolving the alert (I'm OK).
      if (pendingReportRef.current) {
          console.log("Cleanup triggered while pending report existed. Auto-saving fall report.");
          await finalizeReportAndSave(pendingReportRef.current);
          return;
      }
      
      // Otherwise, save a simple cleanup report
      const now = new Date();
      const reportId = `CLEANUP-${now.getTime()}`; 
      
      const cleanupReport = {
        id: reportId,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        location: "Cleanup: Monitoring Disabled", 
        type: "Cleanup",
        severity: "N/A",
        angle: "N/A", velocity: "N/A", pressure: "N/A", // Use N/A for cleanup to distinguish
        fileUri: null, 
        timestamp: now.getTime(),
      } as LatestReportData; 
        
      await addReport(cleanupReport, true); 
      console.log("✅ Manual cleanup report saved to Firestore.");
    };


    // Initial load
    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <ReportContext.Provider value={{ 
            latestReport, 
            setLatestReport, 
            allReports, 
            addReport, 
            fetchReports,
            triggerManualSave, 
        }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReport = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
};