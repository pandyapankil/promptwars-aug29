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

export async function initFirebase(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const config = await fetch('/api/config').then(r => r.json());
    _app = initializeApp(config);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _storage = getStorage(_app);
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
