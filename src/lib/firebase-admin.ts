import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
// Initialize Firebase Admin
const apps = getApps()

if (!apps.length) {
  const serviceAccountBase64 = process.env.FIREBASE_ADMIN_KEY_BASE64
  if (!serviceAccountBase64) {
    throw new Error('FIREBASE_ADMIN_KEY_BASE64 environment variable is not set')
  }

  try {
    // Decode base64 to JSON string, then parse to object
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString())

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    })
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    throw new Error('Failed to initialize Firebase Admin with provided credentials')
  }
}

export const db = getFirestore()
export const auth = getAuth()
export const storage = getStorage()
