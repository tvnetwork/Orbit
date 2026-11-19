import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { UserProfile } from '../types';

export const KONTYRA_AUTH_PORTAL = 'https://accounts.kontyra.name.ng/auth';
export const KONTYRA_APP_ID = 'vyntajobs';
export const KONTYRA_STORAGE_KEY = 'kontyra_vyntajobs_session';

export interface KontyraSSOUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  isKontyraSSO: boolean;
  providerData: Array<{
    providerId: string;
    email: string;
    displayName: string;
  }>;
}

/**
 * Initiates the Kontyra Identity Single Sign-On flow.
 * Redirects the user to the central Kontyra Auth portal.
 */
export function initiateKontyraSSO(targetApp: string = KONTYRA_APP_ID) {
  const returnUrl = encodeURIComponent(`${window.location.origin}/?sso=1`);
  const idpUrl = `${KONTYRA_AUTH_PORTAL}?client_id=${encodeURIComponent(targetApp)}&clientId=${encodeURIComponent(targetApp)}&targetApp=${encodeURIComponent(targetApp)}&app=${encodeURIComponent(targetApp)}&app_id=${encodeURIComponent(targetApp)}&appId=${encodeURIComponent(targetApp)}&returnUrl=${returnUrl}&redirect_uri=${returnUrl}`;
  window.location.href = idpUrl;
}

/**
 * Reads any stored Kontyra SSO session from localStorage.
 */
export function getStoredKontyraSession(): KontyraSSOUser | null {
  try {
    const raw = localStorage.getItem(KONTYRA_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored Kontyra session:', err);
    return null;
  }
}

/**
 * Clears the stored Kontyra SSO session.
 */
export function clearStoredKontyraSession() {
  try {
    localStorage.removeItem(KONTYRA_STORAGE_KEY);
  } catch {}
}

/**
 * Decodes a standard JWT payload safely without external dependencies.
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonString = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonString);
  } catch (err) {
    console.warn('JWT decoding error:', err);
    return null;
  }
}

/**
 * Handles incoming Kontyra SSO return parameters on app startup.
 * Returns the authenticated KontyraSSOUser if the URL had SSO parameters.
 */
export async function handleKontyraSSOCallback(): Promise<KontyraSSOUser | null> {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const tokenParam = params.get('token') || params.get('customToken') || params.get('access_token') || params.get('id_token');
  const isSsoParam = params.get('sso') === '1' || params.get('sso') === 'true';
  const ssoEmailParam = params.get('email');
  const ssoNameParam = params.get('name') || params.get('displayName');
  const ssoUidParam = params.get('uid') || params.get('sub');
  const ssoPhotoParam = params.get('photoURL') || params.get('picture');

  if (!tokenParam && !(isSsoParam && ssoEmailParam)) {
    return null;
  }

  // Remove SSO parameters from URL bar to prevent refresh loops
  try {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('token');
    cleanUrl.searchParams.delete('customToken');
    cleanUrl.searchParams.delete('access_token');
    cleanUrl.searchParams.delete('id_token');
    cleanUrl.searchParams.delete('sso');
    cleanUrl.searchParams.delete('email');
    cleanUrl.searchParams.delete('name');
    cleanUrl.searchParams.delete('displayName');
    cleanUrl.searchParams.delete('uid');
    cleanUrl.searchParams.delete('sub');
    cleanUrl.searchParams.delete('photoURL');
    cleanUrl.searchParams.delete('picture');
    window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
  } catch (err) {
    console.warn('Could not clean SSO URL params:', err);
  }

  let resolvedEmail = ssoEmailParam || '';
  let resolvedUid = ssoUidParam || '';
  let resolvedName = ssoNameParam || '';
  let resolvedPhoto = ssoPhotoParam || '';

  // Attempt Firebase Custom Token sign-in first if a token is provided
  if (tokenParam) {
    try {
      const cred = await signInWithCustomToken(auth, tokenParam);
      if (cred.user) {
        resolvedEmail = cred.user.email || resolvedEmail;
        resolvedUid = cred.user.uid;
        resolvedName = cred.user.displayName || resolvedName;
        resolvedPhoto = cred.user.photoURL || resolvedPhoto;
      }
    } catch (fbErr) {
      console.log('Firebase Custom Token exchange bypassed; decoding cross-project claims:', fbErr);
      const decoded = decodeJwtPayload(tokenParam);
      if (decoded) {
        resolvedEmail = decoded.email || decoded.claims?.email || resolvedEmail;
        resolvedUid = decoded.uid || decoded.sub || decoded.user_id || resolvedUid;
        resolvedName = decoded.name || decoded.displayName || decoded.claims?.name || resolvedName;
        resolvedPhoto = decoded.picture || decoded.photoURL || resolvedPhoto;
      }
    }
  }

  if (!resolvedEmail && !resolvedUid) {
    return null;
  }

  const normalizedEmail = (resolvedEmail || 'user@kontyra.internal').toLowerCase().trim();
  let finalUid = resolvedUid || `kontyra_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  let finalName = resolvedName || normalizedEmail.split('@')[0] || 'Kontyra Talent';

  // 1. Search for an existing user account created with this email
  let existingUserDocId: string | null = null;
  let existingUserProfile: UserProfile | null = null;

  try {
    const emailQ = query(
      collection(db, 'users'),
      where('email', '==', normalizedEmail),
      limit(1)
    );
    const snap = await getDocs(emailQ);
    if (!snap.empty) {
      const matchDoc = snap.docs[0];
      existingUserDocId = matchDoc.id;
      existingUserProfile = matchDoc.data() as UserProfile;
      console.log(`Recognized existing account for email ${normalizedEmail} with UID: ${existingUserDocId}`);
    }
  } catch (err) {
    console.warn('Could not query existing account by email:', err);
  }

  // If existing user account exists, adopt its canonical UID and profile data!
  if (existingUserDocId) {
    finalUid = existingUserDocId;
    if (existingUserProfile) {
      finalName = existingUserProfile.displayName || finalName;
      resolvedPhoto = existingUserProfile.photoURL || resolvedPhoto;
    }
  }

  const sessionUser: KontyraSSOUser = {
    uid: finalUid,
    email: normalizedEmail,
    displayName: finalName,
    photoURL: resolvedPhoto,
    emailVerified: true,
    isKontyraSSO: true,
    providerData: [
      {
        providerId: 'kontyra.identity',
        email: normalizedEmail,
        displayName: finalName,
      },
    ],
  };

  try {
    localStorage.setItem(KONTYRA_STORAGE_KEY, JSON.stringify(sessionUser));
  } catch {}

  // 2. Ensure Firestore profile is linked or created
  try {
    const userDocRef = doc(db, 'users', finalUid);
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      // Existing profile found: link SSO and touch lastActive
      await updateDoc(userDocRef, {
        lastActive: serverTimestamp(),
        kontyraSsoUid: resolvedUid || finalUid,
        isKontyraLinked: true,
      });
    } else {
      // Create new profile for first-time Kontyra user
      const newProfile: Partial<UserProfile> = {
        uid: finalUid,
        email: normalizedEmail,
        displayName: finalName,
        photoURL: resolvedPhoto || undefined,
        role: 'freelancer',
        verificationStatus: 'verified',
        rating: 5.0,
        completedJobs: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newProfile);
    }
  } catch (fsErr) {
    console.warn('Could not sync Kontyra profile to Firestore:', fsErr);
  }

  return sessionUser;

  return sessionUser;
}
