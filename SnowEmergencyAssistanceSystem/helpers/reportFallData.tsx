// context/ReportContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Ensure the ID is explicitly defined as a string here
interface LatestReportData {
    id: string; 
    date: string;
    time: string;
    location: string;
    type: string;
    severity: string;
    angle: string;
    velocity: string;
    pressure: string;
    fileUri: string | null;
    mockContent?: string; // Field to hold mock raw data content
}

interface ReportContextType {
    latestReport: LatestReportData | null;
    allReports: LatestReportData[];
    setLatestReport: (report: LatestReportData | null) => void;
    addReport: (report: LatestReportData) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

// --- Static Mock Data ---
const MOCK_CSV_DATA = `Timestamp,FallState,AccelMag(m/s2),BaroPressure(hPa),LinearX,LinearY,LinearZ
2025-12-08T05:50:00Z,idle,9.810,1013.25,0.000,0.000,0.000
2025-12-08T05:50:00Z,fall_detected,18.500,1013.20,6.000,2.500,1.800
2025-12-08T05:50:01Z,impact,1.500,1013.15,0.000,0.000,0.000
--- Sensor Log End ---`;
// --------------------------

const PEAK_VELOCITY = '9.8 m/s²';     // AccelMag peak
const PEAK_PRESSURE = '0 hPa';     // BaroPressure at peak
const SIMULATED_ANGLE = '85.5 deg';      // Plausible angle for fall event (not in CSV, manually set)

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const [latestReport, setLatestReport] = useState<LatestReportData | null>(null);
    
    // 🛑 STATIC DEBUG DATA: Used for testing history screen connectivity 🛑
    const [allReports, setAllReports] = useState<LatestReportData[]>([
        {
            id: 'STATIC-001',
            date: '12/08/2025',
            time: '05:50 PM',
            location: "Fargo, ND", 
            type: "Slip",
            severity: "High",
            angle: SIMULATED_ANGLE,
            velocity: PEAK_VELOCITY,
            pressure: PEAK_PRESSURE,
            // Using the MOCK-FILE-URI identifier
            fileUri: 'MOCK-FILE-URI', 
            // 🛑 Functional mock content for testing the details parser 🛑
            mockContent: MOCK_CSV_DATA,
        }
    ]);
    // --------------------------------------------------------------------------

    const addReport = (report: LatestReportData) => {
        // Ensure that we check for duplicates based on the string ID
        if (!allReports.some(r => r.id === report.id)) {
            setAllReports(prev => [report, ...prev]); 
        }
    };

    return (
        <ReportContext.Provider value={{ latestReport, setLatestReport, allReports, addReport }}>
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