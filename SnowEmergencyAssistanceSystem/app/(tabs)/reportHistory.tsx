// app/(tabs)/yourReportsScreen.js

import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"; 
import { useReport } from '@/context/firebaseService'; 
import SideMenu from './sideMenu'; 


export default function YourReportsScreen() {
  // allReports now contains data fetched from Firestore and is already sorted by timestamp (newest first)
  const { allReports } = useReport(); 

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const openSidebar = () => setIsMenuVisible(true);
  const closeSidebar = () => setIsMenuVisible(false);
  
  // 🛑 ARRAY CODE (COMMENTED OUT) 🛑
  /*
  // --- OLD MOCK DATA SORTING LOGIC ---
  const sortedReports = allReports.slice().sort((a, b) => {
      // Assuming ID contains a timestamp (e.g., STATIC-1700000000)
      const timeA = parseInt(a.id.split('-')[1] || '0');
      const timeB = parseInt(b.id.split('-')[1] || '0');
      return timeB - timeA;
  });
  // ----------------------------------
  */
  
  // Since allReports is now sorted by Firestore's orderBy('timestamp', 'desc'), 
  // we use it directly for display.
  const sortedReports = allReports; 
  const latestReport = sortedReports[0];
  
  // Log the array content to confirm data is received
  useEffect(() => {
    console.log(`✅ HISTORY SCREEN LOADED. Reports count: ${allReports.length}`);
  }, [allReports]);
  
  const navigateToReport = (report) => {
    router.push({
      pathname: "/reportDetails", 
      params: { 
        reportId: report.id, 
        reportName: `Record, ${report.date} ${report.time}`, 
      } 
    });
  };
  
  const navigateToLatestReport = () => {
    if (latestReport) {
        navigateToReport(latestReport);
    }
  };

  return (
    <View style={styles.container}>

    {/* Top Bar */}
    <View style={styles.topRow}>
        <TouchableOpacity
        onPress={openSidebar}>
          <Ionicons name="menu" size={32} color="#b30000" />
        </TouchableOpacity>
      </View>

      {/* MODAL: Side Menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={closeSidebar} 
      >
        <SideMenu onClose={closeSidebar} />
      </Modal>

      {/* Logo and Title */}
      <Image source={require("../../assets/images/snow.png")} style={styles.logo} />
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Latest Report Display */}
      <Text style={[styles.subtitle, { marginTop: 20, marginBottom: 10 }]}>Latest Report</Text>
      
      {latestReport ? (
          <TouchableOpacity
              style={styles.latestReportArea}
              onPress={navigateToLatestReport} 
          >
              <Text style={styles.latestReportText}>
                  Record, {latestReport.date} {latestReport.time}
              </Text>
          </TouchableOpacity>
      ) : (
          <Text style={{textAlign: 'center', fontSize: 18, marginBottom: 30}}>No fall reports detected yet.</Text>
      )}
      
      <Text style={[styles.subtitle, { marginBottom: 10 }]}>History (Count: {allReports.length})</Text>
      
      <ScrollView style={styles.listWrapper}>
          {sortedReports.map((report) => (
              <TouchableOpacity 
                  // Use report.id which is the Firestore document ID
                  key={report.id} 
                  style={styles.reportBtn}
                  onPress={() => navigateToReport(report)}
              >
                  <Text style={styles.reportText}>Record, {report.date} {report.time}</Text>
              </TouchableOpacity>
          ))}
      </ScrollView>


      {/* HOME BUTTON */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.homeText}>Home</Text>
      </TouchableOpacity>

    </View>
  );
}

// ... (Styles remain the same) ...
const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 25, backgroundColor: "#fff", },
    topRow: { width: "100%", marginBottom: 20 },
    logo: { width: 85, height: 85, alignSelf: "center", marginBottom: 5, },
    appTitle: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 5, },
    subtitle: { fontSize: 26, fontWeight: "700", textAlign: "center", },
    latestReportArea: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#f0f0f0', paddingBottom: 10, },
    latestReportText: { fontSize: 22, fontWeight: "600", textAlign: "center", color: "#b30000", },
    listWrapper: { width: "100%", marginTop: 10, flex: 1, },
    reportBtn: { backgroundColor: "#ff8a80", paddingVertical: 14, borderRadius: 6, marginBottom: 20, borderWidth: 1, borderColor: "#d9534f", },
    reportText: { fontSize: 18, fontWeight: "600", textAlign: "center", color: "#000", },
    homeButton: { marginTop: 20, marginBottom: 40, borderWidth: 1, borderColor: "#000", borderRadius: 8, paddingVertical: 10, alignSelf: "center", width: 200, },
    homeText: { fontSize: 18, textAlign: "center", fontWeight: "600", },
});