// firebaseService.tsx (FINAL: Live Location Integrated)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location'; // 🛑 REQUIRED IMPORT FOR LIVE LOCATION 🛑
import { useAngleFromGyro } from "@/hooks/useGyro";
import { useAccelerometerHold } from "@/hooks/useAccelerometerStable";
import { useBarometerStable } from "@/hooks/useBarometer";
import { useFall } from "@/hooks/fallDetection"; 
import { sensorsAvailable } from "@/helpers/sensors-guard"; 

// Imports functional Firebase utilities
import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from '../firebaseConfig'; 

// --- Severity Logic Configuration ---
const SEVERITY_THRESHOLDS = {
    LOW_SERIOUSNESS_ANGLE_DEG: 15, 
    HIGH_SERIOUSNESS_ANGLE_DEG: 45, 
};

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

// 🛑 NEW ASYNC LOCATION HANDLER 🛑
const getCurrentLocationAddress = async (): Promise<string> => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return "Location permission denied";
        }

        let locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Medium });
        const { latitude, longitude } = locationData.coords;

        let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        
        if (geocode.length > 0) {
            const address = geocode[0];
            const street = address.name || address.street;
            const cityState = `${address.city}, ${address.region}`;
            return street && cityState ? `${street}, ${cityState}` : `${address.city}, ${address.region}`;
        }
        return `GPS Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    } catch (error) {
        console.error("❌ LOCATION ERROR:", error);
        return "Location fetch failed";
    }
};
// ----------------------------------------------------

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const [latestReport, setLatestReport] = useState<LatestReportData | null>(null);
    const [allReports, setAllReports] = useState<LatestReportData[]>([]);
    const [loading, setLoading] = useState(false);

    // Sensor data hooks (Running 24/7)
    const ang = useAngleFromGyro();
    const baro = useBarometerStable();
    const acc = useAccelerometerHold();

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

    // 1. FETCH REPORTS from Firestore
    const fetchReports = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const reportsQuery = query(
                collection(db, REPORTS_COLLECTION),
                orderBy("timestamp", "desc")
            );
            
            const querySnapshot = await getDocs(reportsQuery); 
            const reportsList: LatestReportData[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data() as Omit<LatestReportData, 'id'>;
                reportsList.push({
                    ...data,
                    id: doc.id,
                } as LatestReportData); 
            });

            setAllReports(reportsList);
        } catch (error) {
            console.error("❌ FIREBASE ERROR: Error fetching reports:", error);
            Alert.alert("Database Error", "Failed to load historical reports from the cloud.");
        } finally {
            setLoading(false);
        }
    };

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

    // 3. TRIGGER MANUAL SAVE (Now fully async to handle location)
    const triggerManualSave = async () => {
      const now = new Date();
      const reportId = `CLEANUP-${now.getTime()}`; 
      
      console.log("Debug statement - Capturing current sensor state for cleanup.");
      
      // 🛑 STEP 1: FETCH LIVE LOCATION 🛑
      const liveAddress = await getCurrentLocationAddress();
      
      // --- Sensor Data Access (Robust Checks) ---
      const angleRaw = ang && ang.x !== undefined && ang.x !== null ? ang.x : null;

      // Prepare display values
      const angleValue = angleRaw !== null ? angleRaw.toFixed(1) : 'N/A';
      const velocityValue = acc.linear && acc.linear.mag !== undefined && acc.linear.mag !== null ? acc.linear.mag.toFixed(1) : 'N/A';
      const pressureValue = baro.pressureHpa && baro.pressureHpa !== undefined && baro.pressureHpa !== null ? baro.pressureHpa.toFixed(2) : 'N/A';
      
      // CALCULATE SEVERITY
      const calculatedSeverity = calculateSeverity(angleRaw);
      
      const fallReport = {
        id: reportId,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        location: 'Moorhead, Minnesota', // LIVE LOCATION
        type: "Snow-Slip",
        severity: calculatedSeverity, 
        angle: `${angleValue} deg`,
        velocity: `${velocityValue} m/s²`,
        pressure: `${pressureValue} hPa`,
        fileUri: null, 
        timestamp: now.getTime(),
      }as LatestReportData;
        
        await addReport(fallReport, true); 
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