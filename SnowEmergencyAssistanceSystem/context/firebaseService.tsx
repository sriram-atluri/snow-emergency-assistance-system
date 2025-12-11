// firebaseService.tsx (Final: Saves Numeric Location Data)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location'; 
// --- Import Sensor Hooks ---
import { useAngleFromGyro } from "@/hooks/useGyro";
import { useAccelerometerHold } from "@/hooks/useAccelerometerStable";
import { useBarometerStable } from "@/hooks/useBarometer";
import { useFall } from "@/hooks/fallDetection"; 

// Imports functional Firebase utilities
import { 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} 
from '../firebaseConfig'; 

// --- New Interfaces for Location Data ---
interface Coords {
    lat: number; 
    lng: number; 
}

interface LocationData {
    address: string; // e.g., "Moorhead, Minnesota"
    coords: Coords;  // e.g., { lat: 46.872, lng: -96.790 }
}

const SEVERITY_THRESHOLDS = {
    LOW_SERIOUSNESS_ANGLE_DEG: 15, 
    HIGH_SERIOUSNESS_ANGLE_DEG: 45, 
};

// --- Updated LatestReportData Interface ---
interface LatestReportData {
    id?: string; 
    date: string;
    time: string;
    locationAddress: string; // New: For human display (e.g., "Moorhead, Minnesota")
    location: Coords;        // New: For numeric map querying
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
    createAndSaveReport: (isFallEvent: boolean) => Promise<void>; 
    fetchReports: () => Promise<void>;
    triggerManualSave: () => Promise<void>; 
    isMonitoringActive: boolean; 
    toggleMonitoring: () => void;
    lastFallDetectedTime: number | null; 
    setLastFallDetectedTime: (time: number | null) => void; 
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);
const REPORTS_COLLECTION = "fallReports"; 

// --- Location and Severity Helpers (Keep these the same) ---

// 🛑 MODIFIED: Returns object with string address and numeric coordinates
const getCurrentLocationAddress = async (): Promise<LocationData> => {
    
    // Default/Fallback coordinates (Fargo/Moorhead region)
    let defaultCoords: Coords = { lat: 46.8772, lng: -96.7898 }; 
    let finalAddress = "Location permission denied";

    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return { address: finalAddress, coords: defaultCoords }; // Return default coords on denial
        }

        let locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Medium });
        const { latitude, longitude } = locationData.coords;
        
        // Update default coordinates to the actual current location
        defaultCoords = { lat: latitude, lng: longitude };

        let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        
        if (geocode.length > 0) {
            const address = geocode[0];
            const street = address.name || address.street;
            const cityState = `${address.city}, ${address.region}`;
            finalAddress = street && cityState ? `${street}, ${cityState}` : `${address.city}, ${address.region}`;
        } else {
            finalAddress = `GPS Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
        
        return { 
            address: finalAddress, 
            coords: { lat: latitude, lng: longitude } // <-- Returns the critical numeric coordinates
        };

    } catch (error) {
        console.error("❌ LOCATION ERROR:", error);
        return { address: "Location fetch failed", coords: defaultCoords };
    }
};

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
    const [isMonitoringActive, setIsMonitoringActive] = useState(false); 
    const [latestReport, setLatestReport] = useState<LatestReportData | null>(null);
    // NOTE: allReports interface needs to be updated to handle the new location object structure
    const [allReports, setAllReports] = useState<LatestReportData[]>([]); 
    const [loading, setLoading] = useState(false);
    
    const [lastFallDetectedTime, setLastFallDetectedTime] = useState<number | null>(null);

    // Sensor data hooks (Running 24/7)
    const ang = useAngleFromGyro();
    const baro = useBarometerStable();
    const acc = useAccelerometerHold();
    
    // Fall Detection Hook (RUNS HERE)
    const { isFallDetected, fallState, lastEvent } = useFall(); 

    const toggleMonitoring = () => {
        setIsMonitoringActive(prev => !prev);
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

    // 2. CORE REPORT CREATION
    const createAndSaveReport = async (isFallEvent: boolean = false) => {
        const now = new Date();
        const reportId = `REPORT-${now.getTime()}`; 
        
        // 🛑 FIX: Get both address string and coordinates map
        const locationResult = await getCurrentLocationAddress();
        
        // Use sensor data from hooks
        const angleRaw = ang && ang.x !== undefined && ang.x !== null ? ang.x : null;

        const angleValue = angleRaw !== null ? angleRaw.toFixed(1) : 'N/A';
        const velocityValue = acc.linear && acc.linear.mag !== undefined && acc.linear.mag !== null ? acc.linear.mag.toFixed(1) : 'N/A';
        const pressureValue = baro.pressureHpa && baro.pressureHpa !== undefined && baro.pressureHpa !== null ? baro.pressureHpa.toFixed(2) : 'N/A';
        
        const calculatedSeverity = calculateSeverity(angleRaw);
        
        const fallReport: LatestReportData = {
            id: reportId,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            
            // 🛑 FIX: Save the human-readable address string
            locationAddress: locationResult.address, 
            
            // 🛑 FIX: Save the numeric coordinates as a map (required for the map query)
            location: locationResult.coords, 
            
            type: isFallEvent ? "Automatic Fall Detection" : "Manual Save", 
            severity: calculatedSeverity, 
            angle: `${angleValue} deg`,
            velocity: `${velocityValue} m/s²`,
            pressure: `${pressureValue} hPa`,
            fileUri: null, 
            timestamp: now.getTime(),
            mockContent: `Fall State: ${fallState}. Reason: ${lastEvent?.reason ?? 'N/A'}`, 
        };
            
        await addDoc(collection(db, REPORTS_COLLECTION), fallReport as any); // Use 'as any' if TypeScript complains about object types
        setLatestReport(fallReport);
        
        // Trigger the UI alert in index.tsx
        if (isFallEvent) {
            setLastFallDetectedTime(now.getTime()); 
        }

        fetchReports(); 
        
        console.log(`✅ Report saved to Firestore. Type: ${fallReport.type}`);
    };


    // 3. TRIGGER MANUAL SAVE 
    const triggerManualSave = async () => {
        await createAndSaveReport(false); 
    };


    // 4. AUTOMATED FALL DETECTION AND LOGGING LOGIC 
    useEffect(() => {
        if (isMonitoringActive && isFallDetected) {
            console.log("🚨🚨 Fall detected while monitoring is active! Saving report...");
            createAndSaveReport(true); 
        }
    }, [isFallDetected, isMonitoringActive]); 

    
    // DEBUGGING LOGS 
    useEffect(() => {
        console.log(
            `[FALL STATE DEBUG] Monitoring: ${isMonitoringActive ? 'ON' : 'OFF'} | ` +
            `Fall: ${isFallDetected ? 'TRUE' : 'FALSE'} | ` +
            `State: ${fallState} | ` +
            `Linear Mag: ${acc.linear?.mag ? acc.linear.mag.toFixed(2) : 'N/A'} m/s²`
        );
    }, [isFallDetected, isMonitoringActive, fallState, acc.linear?.mag]);


    // Initial load
    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <ReportContext.Provider value={{ 
            latestReport, 
            setLatestReport, 
            allReports, 
            createAndSaveReport, 
            fetchReports, 
            triggerManualSave, 
            isMonitoringActive,
            toggleMonitoring,
            lastFallDetectedTime, 
            setLastFallDetectedTime, 
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