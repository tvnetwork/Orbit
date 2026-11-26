import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';
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
export const KONTYRA_TOKEN_KEY = 'kontyra_vyntajobs_token';

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
    localStorage.removeItem(KONTYRA_TOKEN_KEY);
  } catch {}
}

/**
 * Checks whether a token is a Firebase custom token meant specifically for this Firebase project.
 * Firebase custom tokens issued by the Firebase Admin SDK for a project contain an audience targeting
 * https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit
 * and issuer corresponding to the service account or firebase project.
 */
function isProjectCustomToken(token: string): boolean {
  if (!token) return false;
  const decoded = decodeJwtPayload(token);
  if (!decoded) return false;

  // If the token has an aud or iss explicitly pointing to another project or non-identitytoolkit service, skip exchange
  const targetAud = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
  if (decoded.aud && decoded.aud !== targetAud) {
    return false;
  }
  // If the issuer or claims explicitly reference another firebase project id, skip exchange
  if (decoded.iss && typeof decoded.iss === 'string' && !decoded.iss.includes(firebaseConfig.projectId) && !decoded.iss.includes('securetoken.google.com')) {
    // If issuer is a service account of another project, e.g. voltaic-space-...
    if (decoded.iss.includes('gserviceaccount.com') && !decoded.iss.includes(firebaseConfig.projectId)) {
      return false;
    }
  }

  return true;
}

/**
 * Ensures Firebase Auth is actively authenticated if a stored token exists.
 */
export async function ensureFirebaseAuth(): Promise<void> {
  if (auth.currentUser) return;
  try {
    const storedToken = localStorage.getItem(KONTYRA_TOKEN_KEY);
    if (storedToken && isProjectCustomToken(storedToken)) {
      try {
        await signInWithCustomToken(auth, storedToken);
      } catch (err: any) {
        // Silently capture invalid token without triggering repeated retries
        console.info("Stored custom token cannot be exchanged with this Firebase project; continuing with session:", err?.code || err?.message);
      }
    }
  } catch (err) {
    console.warn("Stored auth session notice:", err);
  }
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

  const decoded = tokenParam ? decodeJwtPayload(tokenParam) : null;
  const emailFromJwt =
    decoded?.email ||
    decoded?.claims?.email ||
    decoded?.claims?.claims?.email ||
    decoded?.user?.email ||
    decoded?.data?.email ||
    decoded?.identity?.email;

  const nameFromJwt =
    decoded?.fullName ||
    decoded?.name ||
    decoded?.displayName ||
    decoded?.claims?.fullName ||
    decoded?.claims?.name;

  const uidFromJwt =
    decoded?.uid ||
    decoded?.sub ||
    decoded?.user_id ||
    decoded?.userId ||
    decoded?.claims?.uid;

  const photoFromJwt =
    decoded?.picture ||
    decoded?.photoURL ||
    decoded?.photoUrl ||
    decoded?.claims?.picture;

  let resolvedEmail = ssoEmailParam || emailFromJwt || '';
  let resolvedUid = ssoUidParam || uidFromJwt || '';
  let resolvedName = ssoNameParam || nameFromJwt || '';
  let resolvedPhoto = ssoPhotoParam || photoFromJwt || '';

  // Attempt Firebase Custom Token sign-in if a project-compatible token is provided
  if (tokenParam) {
    try {
      localStorage.setItem(KONTYRA_TOKEN_KEY, tokenParam);
    } catch {}

    if (isProjectCustomToken(tokenParam)) {
      try {
        const cred = await signInWithCustomToken(auth, tokenParam);
        if (cred.user) {
          resolvedUid = cred.user.uid || resolvedUid;
          resolvedEmail = cred.user.email || resolvedEmail;
          resolvedName = cred.user.displayName || resolvedName;
          resolvedPhoto = cred.user.photoURL || resolvedPhoto;

          try {
            const idTokenResult = await cred.user.getIdTokenResult();
            const claimEmail = idTokenResult.claims.email as string;
            if (claimEmail && !resolvedEmail) {
              resolvedEmail = claimEmail;
            }
          } catch {}
        }
      } catch (fbErr) {
        console.info('Firebase Custom Token exchange fallback:', fbErr);
      }
    }
  } else if (!auth.currentUser) {
    try {
      const storedToken = localStorage.getItem(KONTYRA_TOKEN_KEY);
      if (storedToken && isProjectCustomToken(storedToken)) {
        await signInWithCustomToken(auth, storedToken);
      }
    } catch {}
  }

  if (!resolvedEmail && !resolvedUid) {
    return null;
  }

  const normalizedEmail = (resolvedEmail || '').toLowerCase().trim();
  let canonicalUid = resolvedUid || (normalizedEmail ? `kontyra_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : 'kontyra_user');
  let canonicalProfile: UserProfile | null = null;

  // 1. Search for any existing user account created with this email
  if (normalizedEmail) {
    try {
      const q1 = query(
        collection(db, 'users'),
        where('email', '==', normalizedEmail)
      );
      const snap1 = await getDocs(q1);
      let docsList = [...snap1.docs];

      if (resolvedEmail && resolvedEmail.trim() !== normalizedEmail) {
        const q2 = query(
          collection(db, 'users'),
          where('email', '==', resolvedEmail.trim())
        );
        const snap2 = await getDocs(q2);
        for (const d of snap2.docs) {
          if (!docsList.some(existing => existing.id === d.id)) {
            docsList.push(d);
          }
        }
      }

      if (docsList.length > 0) {
        // Sort candidate docs so that the original user account is chosen:
        // Prioritize documents with admin/client role, completed jobs, skills, or non-kontyra UID
        docsList.sort((a, b) => {
          const aData = a.data() as UserProfile;
          const bData = b.data() as UserProfile;
          const score = (p: UserProfile, id: string) => {
            let s = 0;
            if (p.role === 'admin') s += 200;
            if (p.role === 'client') s += 100;
            if (p.completedJobs && p.completedJobs > 0) s += 20;
            if (p.skills && p.skills.length > 0) s += 15;
            if (p.hourlyRate) s += 10;
            if (!id.startsWith('kontyra_') && !id.startsWith('usr_')) s += 50;
            return s;
          };
          return score(bData, b.id) - score(aData, a.id);
        });

        const bestDoc = docsList[0];
        canonicalUid = bestDoc.id;
        canonicalProfile = bestDoc.data() as UserProfile;
        console.log(`Recognized existing account for email ${normalizedEmail} with UID: ${canonicalUid}`);
      }
    } catch (err) {
      console.warn('Could not query existing account by email:', err);
    }
  }

  const finalUid = canonicalUid;
  const finalName = canonicalProfile?.displayName || resolvedName || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Kontyra Talent');
  const finalPhoto = canonicalProfile?.photoURL || resolvedPhoto;

  const sessionUser: KontyraSSOUser = {
    uid: finalUid,
    email: normalizedEmail,
    displayName: finalName,
    photoURL: finalPhoto,
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
    const usernameFromEmail = normalizedEmail ? normalizedEmail.split('@')[0] : '';
    const portfolioUrl = usernameFromEmail ? `https://${usernameFromEmail}.devos.kontyra.name.ng` : undefined;

    if (existingSnap.exists()) {
      // Existing profile found: link SSO, sync DevOS portfolio, and touch lastActive
      const updatePayload: Record<string, any> = {
        lastActive: serverTimestamp(),
        kontyraSsoUid: resolvedUid || finalUid,
        isKontyraLinked: true,
      };
      if (portfolioUrl && !existingSnap.data()?.websiteUrl) {
        updatePayload.websiteUrl = portfolioUrl;
      }
      await updateDoc(userDocRef, updatePayload);
    } else {
      // Create new profile for first-time Kontyra user with automatic DevOS portfolio link
      const newProfile: Partial<UserProfile> = {
        uid: finalUid,
        email: normalizedEmail,
        displayName: finalName,
        photoURL: finalPhoto || undefined,
        role: 'freelancer',
        verificationStatus: 'verified',
        websiteUrl: portfolioUrl,
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
}
