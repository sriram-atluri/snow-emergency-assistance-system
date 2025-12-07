import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, // Keep deleteDoc for completeness
  query,
  orderBy,
  where,
  onSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// --- Interface Definition ---
export interface SnowReport {
  id: string;
  title: string;
  location: string;
  severity: string;
  timeStamped: string;
  date: string;
  userId: string;         // 🚨 Added for consistency 🚨
  createdAt: string;      // System time for sorting
  lastUpdated?: string;   // Optional field for updates
}

// --- Helper to map Firestore Document to TypeScript Interface ---
const mapSnapshotToReport = (snapshot: QuerySnapshot) => {
  return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
  } as SnowReport));
};

// --- 1. CREATE: Add a New Report ---
/**
 * Creates a new SnowReport document in the 'reports' collection.
 * 🚨 Parameters updated to match SnowReport fields. 🚨
 * @returns The ID of the newly created document.
 */
export const createReport = async (
  title: string, 
  location: string, 
  severity: string,       // Changed from 'content'
  timeStamped: string, 
  date: string, 
  userId: string
): Promise<string> => { // 🚨 Added explicit return type 🚨
    try {
      // 🚨 Data payload adapted to SnowReport interface fields 🚨
      const reportData = {
        title,
        location,
        severity, 
        timeStamped,
        date,
        userId,
        createdAt: new Date().toISOString(),
      };
      
      const reportsCollectionRef = collection(db, 'reports');
  
      const docRef = await addDoc(reportsCollectionRef, reportData);
      
      return docRef.id;
  
    } catch (e) {
      console.error("Error creating snow report:", e);
      throw new Error("Failed to save snow report data.");
    }
};

// --- 2. READ (Retrieval): Get All Reports (One-Time Fetch) ---
/**
 * Fetches all documents from the 'reports' collection once.
 * Suitable for data that does not need real-time updates.
 */
export const fetchAllReports = async (): Promise<SnowReport[]> => {
  try {
    const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(reportsQuery);
    
    return mapSnapshotToReport(querySnapshot);

  } catch (e) {
    console.error("Error fetching all reports:", e);
    return [];
  }
};


// --- 3. READ (Retrieval): Real-Time Listener (Subscription) ---
/**
 * Subscribes to reports belonging to a specific user, sorted by creation date.
 * The callback is called immediately and again whenever the data changes.
 * @returns The unsubscribe function to clean up the listener.
 */
export const subscribeToUserReports = (userId: string, callback: (reports: SnowReport[]) => void) => {
  
  const reportsQuery = query(
    collection(db, "reports"), 
    where("userId", "==", userId), 
    orderBy("createdAt", "desc")
  );
  
  const unsubscribe = onSnapshot(reportsQuery, (querySnapshot) => {
    const reports = mapSnapshotToReport(querySnapshot);
    callback(reports);
  });

  return unsubscribe; 
};

// --- 4. UPDATE: Modify Existing Report (Example) ---
// Add this for CRUD completeness and future use.
export const updateReport = async (reportId: string, newSeverity: string): Promise<void> => {
    try {
        const reportDocRef = doc(db, 'reports', reportId);

        await updateDoc(reportDocRef, {
            severity: newSeverity,
            lastUpdated: new Date().toISOString(),
        });
    } catch (e) {
        console.error(`Error updating report ${reportId}:`, e);
        throw new Error("Failed to update report.");
    }
};

// --- 5. DELETE: Remove Report (Example) ---
// Add this for CRUD completeness and future use.
export const deleteReport = async (reportId: string): Promise<void> => {
    try {
        const reportDocRef = doc(db, 'reports', reportId);
        await deleteDoc(reportDocRef);

    } catch (e) {
        console.error(`Error deleting report ${reportId}:`, e);
        throw new Error("Failed to delete report.");
    }
};