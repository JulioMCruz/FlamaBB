import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK (server-side only)
const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Initialize app only if it hasn't been initialized yet
let adminApp
if (getApps().length === 0) {
  adminApp = initializeApp(adminConfig, 'admin')
} else {
  adminApp = getApps().find(app => app.name === 'admin') || getApps()[0]
}

// Export admin services
export const adminAuth = getAuth(adminApp)
export const adminFirestore = getFirestore(adminApp)

// Admin helper functions
export const createCustomToken = async (uid: string, claims?: object) => {
  try {
    const customToken = await adminAuth.createCustomToken(uid, claims)
    return { token: customToken, error: null }
  } catch (error) {
    return { token: null, error: error as Error }
  }
}

export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return { user: decodedToken, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export const setCustomUserClaims = async (uid: string, claims: object) => {
  try {
    await adminAuth.setCustomUserClaims(uid, claims)
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Server-side user management
export const adminGetUser = async (uid: string) => {
  try {
    const userRecord = await adminAuth.getUser(uid)
    return { user: userRecord, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export const adminDeleteUser = async (uid: string) => {
  try {
    await adminAuth.deleteUser(uid)
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Server-side Firestore operations with admin privileges
export const adminCreateUser = async (uid: string, userData: any) => {
  try {
    await adminFirestore.collection('users').doc(uid).set({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const adminUpdateUser = async (uid: string, updates: any) => {
  try {
    await adminFirestore.collection('users').doc(uid).update({
      ...updates,
      updatedAt: new Date(),
    })
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export default adminApp