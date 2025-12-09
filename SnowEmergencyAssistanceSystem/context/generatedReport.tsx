import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView 
} from "react-native";
import { router, useLocalSearchParams } from "expo-router"; 
import * as FileSystem from 'expo-file-system/legacy'; 

import { useReport } from '@/helpers/reportFallData'; 

interface LogMeasurements {
    count: number;
    summary: string;
}

// Helper Function to read the file and extract key measurements
const extractMeasurementsFromFile = (content: string): LogMeasurements => {
    const lines = content.trim().split('\n');
    const dataLines = lines.filter(line => !line.startsWith('Timestamp') && !line.startsWith('---'));
    
    if (dataLines.length === 0) {
        return { count: 0, summary: 'Raw data log is empty.' };
    }
    
    const count = dataLines.length;
    // AccelMag is at index 2 in the CSV data lines
    const firstData = dataLines[0].split(',')[2]; 
    const lastData = dataLines[dataLines.length - 1].split(',')[2];
    
    return {
        count: count,
        summary: `Total Readings: ${count} points. Accel (Start): ${firstData} m/s², Accel (End): ${lastData} m/s²`,
    };
};


export default function ReportDetailsScreen() {
    // 1. Get the parameters passed from YourReportsScreen
    const { reportId, reportName } = useLocalSearchParams<{ reportId?: string, reportName?: string }>();
    
    // 2. Get the array of all reports
    const { allReports } = useReport(); 

    const [logMeasurements, setLogMeasurements] = useState<LogMeasurements | null>(null);
    const [loadingFile, setLoadingFile] = useState(true);

    // 🛑 LOOKUP: Find the specific structured report data using the ID
    const structuredReport = allReports.find(r => r.id === reportId);
    
    // Use the fileUri from the structured report (this should NOT be null if it was added to history)
    const activeFileUri = structuredReport?.fileUri;

    // --- EFFECT TO READ THE FILE ---
    useEffect(() => {
        if (!activeFileUri) {
            setLoadingFile(false);
            return;
        }

        // 🛑 FIX: Bypass file read for mock/debug reports
        if (activeFileUri === 'MOCK-FILE-URI') {
             setLogMeasurements({
                 count: 1,
                 summary: 'No raw log: This is static or test debug data.',
             });
             setLoadingFile(false);
             return;
        }


        const readFileData = async () => {
            try {
                const rawContent = await FileSystem.readAsStringAsync(activeFileUri as string, {
                    encoding: 'utf8',
                });
                
                const measurements = extractMeasurementsFromFile(rawContent);
                setLogMeasurements(measurements);

            } catch (error) {
                console.error("Failed to read sensor log file:", error);
                Alert.alert("File Read Error", `Could not load raw sensor data at ${activeFileUri}.`);
                // Set an error state for the log data if the file read fails
                setLogMeasurements({ count: 0, summary: 'Error: File not found or corrupted.' }); 
            } finally {
                setLoadingFile(false);
            }
        };

        readFileData();
    }, [activeFileUri]);

    
    const defaultText = "N/A";
    const displayData = structuredReport || {}; 
    const contextualMeasurements = `${displayData.angle || defaultText}, ${displayData.velocity || defaultText}, ${displayData.pressure || defaultText}`;

    if (!structuredReport) {
         // Display an error state if the structured data object could not be found
         return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.loadingText}>Error: Structured data not found for ID: {reportId}.</Text>
                <Text style={styles.loadingText}>Check if report was saved before app reload.</Text>
            </View>
        );
    }
    
    if (loadingFile) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#b30000" />
                <Text style={styles.loadingText}>Loading sensor log...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

            {/* Logo and App Title */}
            <Image 
                source={require("../../assets/images/snow.png")} 
                style={styles.logo}
            />
            <Text style={styles.appTitle}>Snow Guard</Text>

            {/* Record Title */}
            <View style={styles.recordHeader}>
                <Text style={styles.recordHeaderText}>{reportName || "Report Details"}</Text>
            </View>

            {/* DETAILS SECTION */}
            <View style={styles.detailBlock}>
                
                {/* Date (From structuredReport) */}
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{displayData.date || defaultText}</Text>
                </View>
                <View style={styles.divider} />

                {/* Location (From structuredReport) */}
                <View style={styles.row}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>{displayData.location || defaultText}</Text>
                </View>
                <View style={styles.divider} />

                {/* Time (From structuredReport) */}
                <View style={styles.row}>
                    <Text style={styles.label}>Time</Text>
                    <Text style={styles.value}>{displayData.time || defaultText}</Text>
                </View>
                <View style={styles.divider} />

                {/* Incident Type (From structuredReport) */}
                <View style={styles.row}>
                    <Text style={styles.label}>Incident Type/Severity</Text>
                    <Text style={styles.value}>{displayData.type || defaultText} / {displayData.severity || defaultText}</Text>
                </View>
                <View style={styles.divider} />

                {/* Contextual Sensor Snap (From structuredReport) */}
                <View style={styles.row}>
                    <Text style={styles.label}>Measurements</Text>
                    <Text style={styles.value}>{contextualMeasurements}</Text>
                </View>
                <View style={styles.divider} />

                {/* Raw Log File Summary (From FileSystem read) */}
                <View style={{ ...styles.row, flexDirection: 'column', paddingVertical: 15 }}>
                    <Text style={{...styles.label, marginBottom: 5}}>Raw Data Log ({logMeasurements?.count} points)</Text>
                    <Text style={styles.value}>
                        {logMeasurements ? logMeasurements.summary : 'Error loading raw data log.'}
                    </Text>
                    <Text style={{ fontSize: 12, marginTop: 5, color: '#999' }}>File: {activeFileUri?.substring(activeFileUri.lastIndexOf('/') + 1)}</Text>
                </View>
                <View style={styles.divider} />

            </View>

            {/* HOME BUTTON */}
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.push("/home")}
            >
                <Text style={styles.homeText}>Home</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

/* -------------------------------- STYLES -------------------------------- */
const styles = StyleSheet.create({
  // ... (Styles) ...
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 25, backgroundColor: "#fff", },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 20, fontSize: 18, color: '#666', },
  logo: { width: 85, height: 85, alignSelf: "center", marginBottom: 5, },
  appTitle: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 20, },
  recordHeader: { backgroundColor: "#ff8a80", paddingVertical: 14, borderWidth: 1, borderColor: "#d9534f", borderRadius: 6, marginBottom: 25, },
  recordHeaderText: { fontSize: 18, fontWeight: "700", textAlign: "center", },
  detailBlock: { width: "100%", },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, },
  label: { fontSize: 16, fontWeight: "600", },
  value: { fontSize: 16, color: "#444", },
  divider: { height: 1, backgroundColor: "#ccc", width: "100%", },
  homeButton: { marginTop: 30, borderWidth: 1, borderColor: "#000", borderRadius: 8, paddingVertical: 10, alignSelf: "center", width: 200, },
  homeText: { fontSize: 18, textAlign: "center", fontWeight: "600", },
});