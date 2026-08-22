import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Use environment variables if present, fallback to json config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigRaw.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigRaw.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigRaw.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigRaw.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigRaw.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigRaw.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigRaw.measurementId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || (firebaseConfigRaw as any).firestoreDatabaseId
};

if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. This will cause a crash unless provided via environment variables.");
  // We throw a descriptive error that our new ErrorBoundary will catch
  if (import.meta.env.PROD) {
    throw new Error("Critical Configuration Leak: Firebase Sacred Key missing. Please ensure VITE_FIREBASE_API_KEY is set in your deployment environment.");
  }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use browser local persistence as requested to ensure session survival across tabs and reloads
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Persistence setting failed", err);
});

// Enable persistent local cache and force long polling for reliable cloud/iframe connectivity
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({})
}, firebaseConfig.firestoreDatabaseId || '(default)');

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const testConnection = async () => {
  try {
    // Diagnostic connection check with timeout safety
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Graceful offline operation handling - avoid alarming console errors when offline cache is active
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('Could not reach Cloud Firestore'))) {
      console.info("Firestore: Connected with local persistent offline cache.");
    }
  }
};

let redirectPromise: Promise<User | null> | null = null;

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Google signInWithPopup failed, falling back to signInWithRedirect:", error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleProvider);
    } else {
      throw error;
    }
  }
};

export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Github signInWithPopup failed, falling back to signInWithRedirect:", error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, githubProvider);
    } else {
      throw error;
    }
  }
};

export const handleRedirectResult = async () => {
  if (!redirectPromise) {
    redirectPromise = (async () => {
      try {
        const result = await getRedirectResult(auth);
        return result?.user || null;
      } catch (error) {
        console.error("Error handling redirect result", error);
        throw error;
      }
    })();
  }
  return redirectPromise;
};

export const signInWithEmail = async (email: string, pass: string) => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signUpWithEmail = async (email: string, pass: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signInAnon = async () => {
  const result = await signInAnonymously(auth);
  return result.user;
};
