import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyANRjCMx1E5-jJkKwPVgHwQpGc9JC3ARLY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lawnproatl-85df0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lawnproatl-85df0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lawnproatl-85df0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '671443673931',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:671443673931:web:1d3a4de26b97ff7bbabece',
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
export const functions = app ? getFunctions(app, 'us-central1') : null
