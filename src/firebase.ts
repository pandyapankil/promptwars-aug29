import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// CRITICAL: Never use import.meta.env.VITE_FIREBASE_* — credentials are undefined at Docker build time.
// Always fetch from /api/config at runtime. This is the only pattern that works on Cloud Run.

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _initPromise: Promise<void> | null = null;

const FALLBACK_CONFIG = {
  apiKey: "AIzaSyAmmvliUGEwfELxNLRiLmtdh6u0XrvrbDE",
  authDomain: "promptwars-aug29.firebaseapp.com",
  projectId: "promptwars-aug29",
  storageBucket: "promptwars-aug29.firebasestorage.app",
  messagingSenderId: "913258105665",
  appId: "1:913258105665:web:a6d323eee3151089102fc0",
};

export async function initFirebase(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    let config = FALLBACK_CONFIG;
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const json = await res.json();
        if (json.apiKey) config = json;
      }
    } catch (e) {
      console.warn('Could not fetch /api/config, using config defaults:', e);
    }
    try {
      _app = initializeApp(config);
      _auth = getAuth(_app);
      _db = getFirestore(_app);
      _storage = getStorage(_app);
    } catch (e) {
      console.error('Firebase initializeApp error:', e);
    }
  })();
  return _initPromise;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) throw new Error('Firebase not initialized. Call initFirebase() first.');
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) throw new Error('Firebase not initialized. Call initFirebase() first.');
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) throw new Error('Firebase not initialized. Call initFirebase() first.');
  return _storage;
}
