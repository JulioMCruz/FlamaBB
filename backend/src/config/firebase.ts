import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminAuth: any;
let adminDb: any;
let adminStorage: any;

// initialize firebase admin lazily
function initializeFirebase() {
  if (adminAuth && adminDb && adminStorage) {
    return { adminAuth, adminDb, adminStorage };
  }

  // firebase admin configuration
  const serviceAccount = {
    type: 'service_account',
    project_id: 'flamabb',
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  // debug: log environment variables (remove in production)
  console.log('Firebase config check:', {
    hasPrivateKey: !!serviceAccount.private_key,
    hasClientEmail: !!serviceAccount.client_email,
    privateKeyLength: serviceAccount.private_key?.length || 0
  });

  // validate required fields
  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Missing required Firebase credentials in environment variables');
  }

  // initialize firebase admin if not already initialized
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }

  // export firebase services
  adminAuth = getAuth();
  adminDb = getFirestore();
  adminStorage = getStorage();

  return { adminAuth, adminDb, adminStorage };
}

// export firebase services
export const getFirebaseServices = () => {
  return initializeFirebase();
};

export const getAdminAuth = () => getFirebaseServices().adminAuth;
export const getAdminDb = () => getFirebaseServices().adminDb;
export const getAdminStorage = () => getFirebaseServices().adminStorage;

export default { adminAuth, adminDb, adminStorage };
