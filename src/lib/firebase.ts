import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  increment 
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

// Log Firebase details on app load for diagnostics (as requested)
console.log("=== [Firebase Diagnostics] Starting Initialization ===");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Database ID:", firebaseConfig.firestoreDatabaseId || "(default)");
console.log("Full Config:", JSON.stringify({
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : undefined
}, null, 2));

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper error handler conforming to the skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const err = error as any;
  console.error("❌ [Firestore Error Captured]");
  console.error("Firestore Full Error:", err);
  if (err) {
    console.error("Error Code:", err.code || 'UNKNOWN_CODE');
    console.error("Error Message:", err.message || String(err));
    if (err.stack) {
      console.error("Error Stack:", err.stack);
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: err instanceof Error ? err.message : String(err),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initialization with comprehensive logging
async function testConnection() {
  console.log("⏳ [Firebase Diagnostics] Testing connectivity to database (deferred/lazy check)...");
}
// testConnection();

/**
 * Saves a service request / contact message to the user's Firestore 'requests' collection.
 */
export async function sendRequest(name: string, phone: string, service: string) {
  const path = "requests";
  try {
    const createdAtArabic = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    const docRef = await addDoc(collection(db, path), {
      name: name.trim(),
      phone: phone.trim().replace(/\s+/g, ''),
      service: service.trim(),
      createdAt: serverTimestamp(),
      createdAtArabic
    });
    return docRef;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Registers or updates a client profile inside the Firestore 'customers' collection (keyed by phone number),
 * and ALSO saves their active request/interest into the 'requests' collection with an auto-generated ID.
 * This ensures that a single customer profile tracks logins cleanly under their phone number document ID,
 * while every individual service request / contact form submission forms a separate, chronological entry
 * under a random ID inside the 'requests' collection that never overwrites old requests.
 */
export async function registerOrUpdateFirebaseCustomer(name: string, phone: string, service: string) {
  const customersPath = "customers";
  const requestsPath = "requests";
  const normalizedPhone = phone.trim().replace(/\s+/g, '');
  const customerDocRef = doc(db, customersPath, normalizedPhone);
  
  try {
    const createdAtArabic = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    const docSnap = await getDoc(customerDocRef);
    if (docSnap.exists()) {
      // Existing customer, update details inside the customers collection and increment logins
      await setDoc(customerDocRef, {
        name: name.trim(),
        preferredService: service.trim(),
        lastLoginAt: serverTimestamp(),
        lastLoginAtArabic: createdAtArabic,
        loginCount: increment(1)
      }, { merge: true });
    } else {
      // New customer, create user record inside customers directory
      await setDoc(customerDocRef, {
        name: name.trim(),
        phone: normalizedPhone,
        preferredService: service.trim(),
        createdAt: serverTimestamp(),
        createdAtArabic: createdAtArabic,
        lastLoginAt: serverTimestamp(),
        lastLoginAtArabic: createdAtArabic,
        loginCount: 1
      });
    }

    // Always create a separate, chronological request log with auto-generated ID so requests are never overwritten
    await addDoc(collection(db, requestsPath), {
      name: name.trim(),
      phone: normalizedPhone,
      service: service.trim(),
      createdAt: serverTimestamp(),
      createdAtArabic: createdAtArabic
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${customersPath}/${normalizedPhone}`);
  }
}
