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
  indexedDBLocalPersistence
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

// Use indexedDB persistence for the best balance of security and longevity in mobile webviews
setPersistence(auth, indexedDBLocalPersistence).catch(err => {
  console.error("Persistence setting failed", err);
});

// Enable persistence for better offline experience
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
}, firebaseConfig.firestoreDatabaseId || '(default)');

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const testConnection = async () => {
  try {
    // The path 'test/connection' is just a placeholder to trigger a network request check
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // We don't rethrow here as this is a background diagnostic check
  }
};

export const signInWithGoogle = async () => {
  try {
    // We prefer popup even on mobile for AI Studio environment to prevent losing iframe state
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    // If popup is blocked, fails or is closed prematurely, we re-throw to AuthView
    // which advises the user on how to proceed.
    throw error;
  }
};

export const signInWithGithub = async () => {
  try {
    // We prefer popup even on mobile for AI Studio environment to prevent losing iframe state
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with GitHub", error);
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Error handling redirect result", error);
    throw error;
  }
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
