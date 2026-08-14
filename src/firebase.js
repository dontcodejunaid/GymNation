// Firebase Cloud Integration & Analytics for Gymnation
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { INITIAL_TRAINERS } from './data/trainersAndScheduleData';
import { DEFAULT_MEMBERSHIP_PLANS } from './data/membershipPlans';
import { hasPassPrefix } from './utils/passId';

// Check if Firebase configuration environment variables are present and valid
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('your_firebase_api_key')
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App & Firestore Database safely
let app = null;
let db = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch((err) => {
        console.warn('Firebase Analytics initialization warning:', err.message);
      });
    }
  } catch (err) {
    console.error('Firebase Initialization Error:', err.message);
  }
} else {
  console.info(
    '🔥 Firebase API keys not configured. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your .env file to enable cloud sync.'
  );
}

export { app, db, analytics };

const BOOKINGS_COLLECTION = 'bookings';
const REVIEWS_COLLECTION = 'reviews';
const TRAINERS_COLLECTION = 'trainers';
const MEMBERSHIPS_COLLECTION = 'memberships';
// Members who actually bought a plan. `memberships` above holds the plan
// catalogue; this one holds the people on those plans.
const MEMBER_SIGNUPS_COLLECTION = 'membershipSignups';
const NEWSLETTER_COLLECTION = 'newsletterSubscribers';

// Helper to create clean document ID for newsletter subscribers (e.g. "you@example.com" -> "you-at-example-com")
function getNewsletterDocId(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const slug = cleanEmail
    .replace(/@/g, '-at-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `sub-${Date.now()}`;
}

/**
 * Save a newsletter subscriber email to Firebase Firestore
 */
export async function saveNewsletterSubscriberToFirebase(email) {
  if (!email || typeof email !== 'string') return null;
  const cleanEmail = email.trim().toLowerCase();
  const docId = getNewsletterDocId(cleanEmail);

  const subscriberData = {
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    status: 'Active',
    source: 'Website Footer'
  };

  // Local storage fallback
  try {
    const localSubs = JSON.parse(localStorage.getItem('gymnation_newsletter_subscribers') || '[]');
    if (!localSubs.some(s => s.email === cleanEmail)) {
      localSubs.unshift(subscriberData);
      localStorage.setItem('gymnation_newsletter_subscribers', JSON.stringify(localSubs));
    }
  } catch (e) {}

  if (!db) {
    console.warn('Firebase DB not initialized. Saved newsletter email locally.');
    return subscriberData;
  }

  try {
    await setDoc(doc(db, NEWSLETTER_COLLECTION, docId), subscriberData, { merge: true });
    return subscriberData;
  } catch (error) {
    console.warn('Firebase newsletter write error:', error.message);
    return subscriberData;
  }
}

// Helper to create clean, readable document IDs in Firestore for trainers (e.g. "Priya Kapoor" -> "priya-kapoor")
function getTrainerDocId(trainerOrName) {
  const name = typeof trainerOrName === 'string' ? trainerOrName : (trainerOrName?.name || trainerOrName?.id || 'trainer');
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `trainer-${Date.now()}`;
}

// Helper to identify legacy 20-character random hash document IDs (e.g. "0TQVg2lCU606oDgpAk0F")
function isLegacyRandomHashDocId(docId) {
  if (!docId || typeof docId !== 'string') return false;
  if (docId.endsWith('-plan')) return true;
  if (docId.length >= 18 && !docId.includes('-') && /[A-Z]/.test(docId) && /[0-9]/.test(docId)) {
    return true;
  }
  return false;
}

// Helper to get exact clean document ID for membership plans (e.g. "silver" -> "silver-plan")
function getDocIdForPlan(plan) {
  if (plan.id === 'basic-plan' || plan.id === 'standard-plan' || plan.id === 'premium-plan') {
    return plan.id;
  }
  if (plan.docId === 'basic-plan' || plan.docId === 'standard-plan' || plan.docId === 'premium-plan') {
    return plan.docId;
  }
  const rawName = plan.name || plan.tier || 'plan';
  const slug = rawName
    .toLowerCase()
    .trim()
    .replace(/\(.*?\)/g, '') // strip parentheses e.g. "(Gym Only)"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug === 'basic' || slug === 'standard' || slug === 'premium') return `${slug}-plan`;
  return slug ? (slug.endsWith('-plan') ? slug : `${slug}-plan`) : `plan-${Date.now()}`;
}

// Helper to create clean, readable document IDs in Firestore for membership signups (e.g. "momo" -> "momo-47700")
function getMemberSignupDocId(signup) {
  const rawName = signup.memberName || signup.name || signup.customer?.name || 'member';
  const nameSlug = rawName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const rawId = signup.id || signup.docId || '';
  const numPart = rawId.replace(/[^0-9]/g, '');
  
  if (nameSlug && numPart) {
    return `${nameSlug}-${numPart}`;
  } else if (nameSlug) {
    return `${nameSlug}-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  return rawId || `member-${Date.now()}`;
}

// Helper to create clean, readable document IDs in Firestore for bookings (e.g. "momo" -> "momo-bf12345")
function getBookingDocId(booking) {
  const rawName = booking.name || booking.customerName || 'booking';
  const nameSlug = rawName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const rawId = booking.id || booking.docId || '';
  const numPart = rawId.replace(/[^0-9]/g, '');
  
  if (nameSlug && numPart) {
    return `${nameSlug}-${numPart}`;
  } else if (nameSlug) {
    return `${nameSlug}-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  return rawId || `booking-${Date.now()}`;
}

// ----------------------------------------------------
// BOOKINGS COLLECTION FIRESTORE INTEGRATION
// ----------------------------------------------------

/**
 * Save booking to Firebase Firestore (with LocalStorage sync)
 */
export async function saveBookingToFirebase(bookingData) {
  const randomId = Math.floor(10000 + Math.random() * 90000);
  const docId = getBookingDocId({ ...bookingData, id: bookingData.id || `GN-${randomId}` });
  const bookingWithId = {
    id: docId,
    docId,
    ...bookingData,
    status: bookingData.status || 'Pending',
    createdAt: bookingData.createdAt || new Date().toISOString()
  };

  if (!db) {
    console.warn('Firebase DB is not initialized. Using local storage fallback.');
    return bookingWithId;
  }

  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, docId), bookingWithId, { merge: true });
    return bookingWithId;
  } catch (error) {
    console.warn('Firebase write unavailable or fallback mode active:', error.message);
    return bookingWithId;
  }
}

// ----------------------------------------------------
// MEMBERSHIP SIGNUPS COLLECTION FIRESTORE INTEGRATION
// ----------------------------------------------------

/**
 * Save membership signup to Firebase Firestore with a name-based document ID (e.g. "momo-47700")
 */
export async function saveMembershipSignupToFirebase(signupData) {
  const docId = getMemberSignupDocId(signupData);
  const signupWithId = {
    ...signupData,
    id: docId,
    docId,
    createdAt: signupData.createdAt || new Date().toISOString()
  };

  if (!db) {
    console.warn('Firebase DB is not initialized. Keeping local signup.');
    return signupWithId;
  }

  try {
    await setDoc(doc(db, MEMBER_SIGNUPS_COLLECTION, docId), signupWithId, { merge: true });
    return signupWithId;
  } catch (error) {
    console.warn('Firebase membership signup write error:', error.message);
    return signupWithId;
  }
}

/**
 * Fetch all membership signups from Firebase Firestore
 */
export async function getMembershipSignupsFromFirebase() {
  if (!db) return [];
  try {
    const q = query(collection(db, MEMBER_SIGNUPS_COLLECTION));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      docId: docSnap.id,
      ...docSnap.data(),
      id: docSnap.id
    }));
  } catch (error) {
    console.warn('Firebase membership signups fetch error:', error.message);
    return [];
  }
}

/**
 * Real-time subscription to membership signups in Firebase Firestore
 */
export function subscribeToMembershipSignups(callback) {
  if (!db) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, MEMBER_SIGNUPS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const signups = snapshot.docs.map((docSnap) => ({
        docId: docSnap.id,
        ...docSnap.data(),
        id: docSnap.id
      }));
      callback(signups);
    }, (error) => {
      console.warn('Membership signups snapshot listener error:', error.message);
      callback([]);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Membership signups subscription failed:', err.message);
    callback([]);
    return () => {};
  }
}

/**
 * Update an existing membership signup in Firebase Firestore
 */
export async function updateMembershipSignupInFirebase(docIdOrMemberId, patch) {
  try {
    if (!docIdOrMemberId) return false;

    const directRef = doc(db, MEMBER_SIGNUPS_COLLECTION, String(docIdOrMemberId));
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await updateDoc(directRef, patch);
      return true;
    }

    const q = query(collection(db, MEMBER_SIGNUPS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find(
      (d) => d.id === docIdOrMemberId || d.data().id === docIdOrMemberId || d.data().docId === docIdOrMemberId
    );

    if (targetDoc) {
      const docRef = doc(db, MEMBER_SIGNUPS_COLLECTION, targetDoc.id);
      await updateDoc(docRef, patch);
      return true;
    }
  } catch (error) {
    console.warn('Firebase membership signup update failed:', error.message);
  }
  return false;
}

/**
 * Delete a membership signup from Firebase Firestore
 */
export async function deleteMembershipSignupFromFirebase(docIdOrMemberId) {
  try {
    if (!docIdOrMemberId) return false;

    const directRef = doc(db, MEMBER_SIGNUPS_COLLECTION, String(docIdOrMemberId));
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await deleteDoc(directRef);
      return true;
    }

    const q = query(collection(db, MEMBER_SIGNUPS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find(
      (d) => d.id === docIdOrMemberId || d.data().id === docIdOrMemberId || d.data().docId === docIdOrMemberId
    );

    if (targetDoc) {
      const docRef = doc(db, MEMBER_SIGNUPS_COLLECTION, targetDoc.id);
      await deleteDoc(docRef);
      return true;
    }
  } catch (error) {
    console.warn('Firebase membership signup delete failed:', error.message);
  }
  return false;
}

function getCleanPhotoUrl(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.default && typeof photo.default === 'string') return photo.default;
  return '';
}

function sanitizeForFirestore(obj) {
  if (obj === null || obj === undefined) return '';
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        cleaned[key] = '';
      } else {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

// ----------------------------------------------------
// TRAINERS COLLECTION FIRESTORE INTEGRATION
// ----------------------------------------------------

/**
 * Auto-seed initial trainers into Firebase Firestore if collection is empty
 */
export async function seedInitialTrainersToFirebase() {
  try {
    const seededList = [];
    for (const trainer of INITIAL_TRAINERS) {
      const docId = getTrainerDocId(trainer);
      const trainerToSave = sanitizeForFirestore({
        ...trainer,
        id: docId,
        docId,
        photo: getCleanPhotoUrl(trainer.photo),
        createdAt: new Date().toISOString()
      });
      await setDoc(doc(db, TRAINERS_COLLECTION, docId), trainerToSave, { merge: true });
      seededList.push({ docId, ...trainerToSave });
    }
    return seededList;
  } catch (error) {
    console.warn('Auto-seeding trainers to Firebase failed:', error.message);
    return [];
  }
}

/**
 * Sync all trainers list (existing + new) to Firebase Firestore
 * Purges duplicate/legacy random hash doc IDs (like "0TQVg2lCU606oDgpAk0F")
 */
export async function syncAllTrainersToFirebase(trainersList = []) {
  const safeInput = Array.isArray(trainersList) && trainersList.length > 0 ? trainersList : [];
  try {
    const combined = [...safeInput, ...INITIAL_TRAINERS];
    const mapByKey = new Map();
    combined.forEach((item) => {
      if (!item) return;
      const cleanId = getTrainerDocId(item);
      if (cleanId && !mapByKey.has(cleanId)) {
        mapByKey.set(cleanId, item);
      }
    });

    const updatedList = [];
    for (const [cleanId, trainer] of mapByKey.entries()) {
      try {
        const trainerToSave = sanitizeForFirestore({
          ...trainer,
          id: cleanId,
          docId: cleanId,
          photo: getCleanPhotoUrl(trainer.photo || trainer.imageUrl),
          createdAt: trainer.createdAt || new Date().toISOString()
        });
        await setDoc(doc(db, TRAINERS_COLLECTION, cleanId), trainerToSave, { merge: true });
        updatedList.push(trainerToSave);
      } catch (itemErr) {
        console.error(`Failed to sync trainer ${cleanId} to Firestore:`, itemErr);
        updatedList.push(trainer);
      }
    }
    return updatedList.length > 0 ? updatedList : INITIAL_TRAINERS;
  } catch (error) {
    console.warn('Sync all trainers to Firebase failed:', error.message);
    return Array.isArray(trainersList) && trainersList.length > 0 ? trainersList : INITIAL_TRAINERS;
  }
}

/**
 * Fetch all trainers from Firebase Firestore
 */
export async function getTrainersFromFirebase() {
  try {
    const q = query(collection(db, TRAINERS_COLLECTION));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((docSnap) => ({
        docId: docSnap.id,
        ...docSnap.data()
      }));
    }

    const seeded = await seedInitialTrainersToFirebase();
    if (seeded.length > 0) return seeded;
  } catch (error) {
    console.warn('Firebase trainers read error:', error.message);
  }
  return INITIAL_TRAINERS;
}

/**
 * Add a new trainer directly to Firebase Firestore on creation (with readable slug doc ID like "priya-kapoor")
 */
export async function addTrainerToFirebase(trainerData) {
  try {
    const docId = getTrainerDocId(trainerData);
    const trainerToSave = sanitizeForFirestore({
      ...trainerData,
      id: docId,
      docId,
      photo: getCleanPhotoUrl(trainerData?.photo || trainerData?.imageUrl),
      createdAt: new Date().toISOString()
    });
    if (db) {
      await setDoc(doc(db, TRAINERS_COLLECTION, docId), trainerToSave, { merge: true });
      console.log(`✅ Trainer ${docId} successfully saved to Firestore!`);
    } else {
      console.warn('⚠️ Firebase DB instance not available. Saved locally.');
    }
    return trainerToSave;
  } catch (error) {
    console.warn('Firebase trainer add failed:', error.message);
    const fallbackId = getTrainerDocId(trainerData);
    return sanitizeForFirestore({
      ...trainerData,
      id: fallbackId,
      docId: fallbackId,
      photo: getCleanPhotoUrl(trainerData?.photo || trainerData?.imageUrl)
    });
  }
}

/**
 * Update an existing trainer in Firebase Firestore
 */
export async function updateTrainerInFirebase(docIdOrTrainerId, patch) {
  try {
    if (!docIdOrTrainerId) return false;
    const cleanPatch = sanitizeForFirestore(patch);

    const directRef = doc(db, TRAINERS_COLLECTION, String(docIdOrTrainerId));
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await updateDoc(directRef, cleanPatch);
      return true;
    }

    const q = query(collection(db, TRAINERS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find(
      (d) => d.id === docIdOrTrainerId || d.data().id === docIdOrTrainerId || d.data().docId === docIdOrTrainerId
    );

    if (targetDoc) {
      const docRef = doc(db, TRAINERS_COLLECTION, targetDoc.id);
      await updateDoc(docRef, cleanPatch);
      return true;
    }
  } catch (error) {
    console.warn('Firebase trainer update failed:', error.message);
  }
  return false;
}

/**
 * Delete a trainer from Firebase Firestore
 */
export async function deleteTrainerFromFirebase(docIdOrTrainerId) {
  try {
    if (!docIdOrTrainerId) return false;

    const targetDocId = typeof docIdOrTrainerId === 'object' 
      ? (docIdOrTrainerId.docId || docIdOrTrainerId.id || docIdOrTrainerId.name)
      : docIdOrTrainerId;

    const cleanId = getTrainerDocId(targetDocId);

    const directRef = doc(db, TRAINERS_COLLECTION, cleanId);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await deleteDoc(directRef);
      console.log(`✅ Trainer ${cleanId} deleted from Firestore!`);
      return true;
    }

    const q = query(collection(db, TRAINERS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find(
      (d) =>
        d.id === String(targetDocId) ||
        d.data().id === String(targetDocId) ||
        d.data().docId === String(targetDocId) ||
        d.id === cleanId ||
        (d.data().name && d.data().name.toLowerCase().trim() === String(targetDocId).toLowerCase().trim())
    );

    if (targetDoc) {
      const docRef = doc(db, TRAINERS_COLLECTION, targetDoc.id);
      await deleteDoc(docRef);
      console.log(`✅ Trainer ${targetDoc.id} deleted from Firestore!`);
      return true;
    }
  } catch (error) {
    console.warn('Firebase trainer delete failed:', error.message);
  }
  return false;
}

/**
 * Real-time listener for trainers collection in Firebase Firestore
 */
export function subscribeTrainersFromFirebase(callback) {
  if (!db) return () => {};
  try {
    const q = query(collection(db, TRAINERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const trainersList = [];
        snapshot.docs.forEach((docSnap) => {
          if (!isLegacyRandomHashDocId(docSnap.id)) {
            trainersList.push({
              docId: docSnap.id,
              ...docSnap.data()
            });
          }
        });
        if (trainersList.length > 0) {
          callback(trainersList);
        }
      },
      (error) => {
        console.warn('Real-time trainers listener error:', error.message);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to trainers:', err);
    return () => {};
  }
}

/**
 * Fetch all bookings from Firebase Firestore
 */
export async function getBookingsFromFirebase() {
  if (!db) {
    console.warn('Firebase DB is not initialized. Unable to fetch remote bookings.');
    return [];
  }

  try {
    let querySnapshot;
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (e) {
      querySnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
    }
    return querySnapshot.docs.map((docSnap) => ({
      docId: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.warn('Firebase read unavailable or fallback mode active:', error.message);
    return [];
  }
}

/**
 * Update an existing booking in Firebase Firestore
 */
export async function updateBookingInFirebase(docIdOrBookingId, patch) {
  try {
    if (docIdOrBookingId && typeof docIdOrBookingId === 'string' && docIdOrBookingId.length > 15 && !hasPassPrefix(docIdOrBookingId)) {
      const docRef = doc(db, BOOKINGS_COLLECTION, docIdOrBookingId);
      await updateDoc(docRef, patch);
      return true;
    }

    const q = query(collection(db, BOOKINGS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find((d) => d.data().id === docIdOrBookingId || d.id === docIdOrBookingId);

    if (targetDoc) {
      const docRef = doc(db, BOOKINGS_COLLECTION, targetDoc.id);
      await updateDoc(docRef, patch);
      return true;
    }
  } catch (error) {
    console.warn('Firebase update unavailable:', error.message);
  }
  return false;
}

/**
 * Delete a booking from Firebase Firestore
 */
export async function deleteBookingFromFirebase(docIdOrBookingId) {
  try {
    if (docIdOrBookingId && typeof docIdOrBookingId === 'string' && docIdOrBookingId.length > 15 && !hasPassPrefix(docIdOrBookingId)) {
      const docRef = doc(db, BOOKINGS_COLLECTION, docIdOrBookingId);
      await deleteDoc(docRef);
      return true;
    }

    const q = query(collection(db, BOOKINGS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find((d) => d.data().id === docIdOrBookingId || d.id === docIdOrBookingId);

    if (targetDoc) {
      const docRef = doc(db, BOOKINGS_COLLECTION, targetDoc.id);
      await deleteDoc(docRef);
      return true;
    }
  } catch (error) {
    console.warn('Firebase delete unavailable:', error.message);
  }
  return false;
}

// ----------------------------------------------------
// MEMBERSHIPS COLLECTION FIRESTORE INTEGRATION
// ----------------------------------------------------

/**
 * Auto-seed initial membership plans into Firebase Firestore if collection is empty
 */
export async function seedInitialMembershipsToFirebase() {
  try {
    const seededList = [];
    for (const plan of DEFAULT_MEMBERSHIP_PLANS) {
      const docId = getDocIdForPlan(plan);
      const planToSave = {
        ...plan,
        id: docId,
        docId,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, MEMBERSHIPS_COLLECTION, docId), planToSave, { merge: true });
      seededList.push({ docId, ...planToSave });
    }
    return seededList;
  } catch (error) {
    console.warn('Auto-seeding memberships to Firebase failed:', error.message);
    return [];
  }
}

/**
 * Sync all membership plans list (existing + new) to Firebase Firestore
 * Purges duplicate/legacy docs like "premium-gym-pt-diet-plan" or "standard-gym-classes-plan"
 */
export async function syncAllMembershipsToFirebase(membershipsList) {
  try {
    const combined = [...DEFAULT_MEMBERSHIP_PLANS, ...membershipsList];
    const mapByKey = new Map();
    combined.forEach((item) => {
      const cleanId = getDocIdForPlan(item);
      if (cleanId && !mapByKey.has(cleanId)) {
        mapByKey.set(cleanId, item);
      }
    });

    const updatedList = [];
    for (const [cleanId, plan] of mapByKey.entries()) {
      const planToSave = {
        ...plan,
        id: cleanId,
        docId: cleanId,
        createdAt: plan.createdAt || new Date().toISOString()
      };
      await setDoc(doc(db, MEMBERSHIPS_COLLECTION, cleanId), planToSave, { merge: true });
      updatedList.push({ docId: cleanId, ...planToSave });
    }
    return updatedList;
  } catch (error) {
    console.warn('Sync all memberships to Firebase failed:', error.message);
    return membershipsList;
  }
}

/**
 * Fetch all membership plans from Firebase Firestore
 */
export async function getMembershipsFromFirebase() {
  try {
    const q = query(collection(db, MEMBERSHIPS_COLLECTION));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((docSnap) => ({
        docId: docSnap.id,
        ...docSnap.data()
      }));
    } else {
      const seeded = await seedInitialMembershipsToFirebase();
      if (seeded.length > 0) return seeded;
    }
  } catch (error) {
    console.warn('Firebase memberships read error:', error.message);
  }
  return [];
}

/**
 * Add a new membership plan directly to Firebase Firestore on creation
 */
export async function addMembershipToFirebase(membershipData) {
  try {
    const docId = getDocIdForPlan(membershipData);
    const planToSave = {
      ...membershipData,
      id: docId,
      docId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, MEMBERSHIPS_COLLECTION, docId), planToSave, { merge: true });
    return planToSave;
  } catch (error) {
    console.warn('Firebase membership add failed:', error.message);
    return null;
  }
}

/**
 * Update an existing membership plan in Firebase Firestore
 */
export async function updateMembershipInFirebase(docIdOrPlanId, patch) {
  try {
    if (!docIdOrPlanId) return false;

    const directRef = doc(db, MEMBERSHIPS_COLLECTION, String(docIdOrPlanId));
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await updateDoc(directRef, patch);
      return true;
    }

    const q = query(collection(db, MEMBERSHIPS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find(
      (d) => d.id === docIdOrPlanId || d.data().id === docIdOrPlanId || d.data().docId === docIdOrPlanId
    );

    if (targetDoc) {
      const docRef = doc(db, MEMBERSHIPS_COLLECTION, targetDoc.id);
      await updateDoc(docRef, patch);
      return true;
    }
  } catch (error) {
    console.warn('Firebase membership update failed:', error.message);
  }
  return false;
}

/**
 * Delete a membership plan from Firebase Firestore
 */
export async function deleteMembershipFromFirebase(docIdOrPlanId) {
  try {
    if (!docIdOrPlanId) return false;

    const directRef = doc(db, MEMBERSHIPS_COLLECTION, String(docIdOrPlanId));
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await deleteDoc(directRef);
      return true;
    }

    const q = query(collection(db, MEMBERSHIPS_COLLECTION));
    const snapshot = await getDocs(q);
    const targetDoc = snapshot.docs.find(
      (d) => d.id === docIdOrPlanId || d.data().id === docIdOrPlanId || d.data().docId === docIdOrPlanId || d.data().name === docIdOrPlanId
    );

    if (targetDoc) {
      const docRef = doc(db, MEMBERSHIPS_COLLECTION, targetDoc.id);
      await deleteDoc(docRef);
      return true;
    }
  } catch (error) {
    console.warn('Firebase membership delete failed:', error.message);
  }
  return false;
}

// ----------------------------------------------------
// MEMBERSHIP SIGNUPS COLLECTION FIRESTORE INTEGRATION
// (every person who takes a membership lands here)
// ----------------------------------------------------
// REVIEWS COLLECTION FIRESTORE INTEGRATION
// ----------------------------------------------------

// ----------------------------------------------------
// REVIEWS COLLECTION FIRESTORE INTEGRATION
// ----------------------------------------------------

/**
 * Save review to Firebase Firestore
 */
export async function saveReviewToFirebase(reviewData) {
  const randomId = Math.floor(10000 + Math.random() * 90000);

  const reviewWithId = {
    id: `RV-${randomId}`,
    ...reviewData,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(
      collection(db, REVIEWS_COLLECTION),
      reviewWithId
    );

    return {
      docId: docRef.id,
      ...reviewWithId
    };
  } catch (error) {
    console.warn('Firebase review write unavailable:', error.message);
    throw error;
  }
}

/**
 * Fetch all reviews from Firebase Firestore
 */
export async function getReviewsFromFirebase() {
  try {
    let querySnapshot;

    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      querySnapshot = await getDocs(q);
    } catch (e) {
      querySnapshot = await getDocs(
        collection(db, REVIEWS_COLLECTION)
      );
    }

    return querySnapshot.docs.map((docSnap) => ({
      docId: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.warn('Firebase review read unavailable:', error.message);
    return [];
  }
}

/**
 * Update review in Firebase Firestore
 */
export async function updateReviewInFirebase(docIdOrReviewId, patch) {
  try {
    if (
      docIdOrReviewId &&
      typeof docIdOrReviewId === 'string' &&
      docIdOrReviewId.length > 15 &&
      !docIdOrReviewId.startsWith('RV-')
    ) {
      await updateDoc(
        doc(db, REVIEWS_COLLECTION, docIdOrReviewId),
        patch
      );
      return true;
    }

    const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));

    const targetDoc = snapshot.docs.find(
      (d) =>
        d.data().id === docIdOrReviewId ||
        d.id === docIdOrReviewId
    );

    if (targetDoc) {
      await updateDoc(
        doc(db, REVIEWS_COLLECTION, targetDoc.id),
        patch
      );
      return true;
    }
  } catch (error) {
    console.warn('Firebase review update unavailable:', error.message);
  }

  return false;
}

/**
 * Delete review from Firebase Firestore
 */
export async function deleteReviewFromFirebase(docIdOrReviewId) {
  try {
    if (
      docIdOrReviewId &&
      typeof docIdOrReviewId === 'string' &&
      docIdOrReviewId.length > 15 &&
      !docIdOrReviewId.startsWith('RV-')
    ) {
      await deleteDoc(doc(db, REVIEWS_COLLECTION, docIdOrReviewId));
      return true;
    }

    const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));

    const targetDoc = snapshot.docs.find(
      (d) =>
        d.data().id === docIdOrReviewId ||
        d.id === docIdOrReviewId
    );

    if (targetDoc) {
      await deleteDoc(
        doc(db, REVIEWS_COLLECTION, targetDoc.id)
      );
      return true;
    }
  } catch (error) {
    console.warn('Firebase review delete unavailable:', error.message);
  }

  return false;
}

/* -------------------------------- About Us -------------------------------- */

export async function getAboutFromFirebase() {
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'about');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Error fetching About data from Firebase:', err);
    return null;
  }
}

export async function saveAboutToFirebase(aboutData) {
  if (!db) return false;
  try {
    const docRef = doc(db, 'settings', 'about');
    await setDoc(docRef, { ...aboutData, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('Error saving About data to Firebase:', err);
    return false;
  }
}

export function subscribeToAboutFromFirebase(callback) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'settings', 'about');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    }, (err) => {
      console.warn('About snapshot error:', err);
    });
  } catch (err) {
    console.warn('About snapshot setup failed:', err);
    return () => {};
  }
}

// ----------------------------------------------------
// SPECIAL OFFER SETTINGS FIRESTORE INTEGRATION
// ----------------------------------------------------

export async function getOfferFromFirebase() {
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'offer');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Error fetching Offer data from Firebase:', err);
    return null;
  }
}

export async function saveOfferToFirebase(offerData) {
  if (!db) return false;
  try {
    const docRef = doc(db, 'settings', 'offer');
    await setDoc(docRef, { ...offerData, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('Error saving Offer data to Firebase:', err);
    return false;
  }
}

export function subscribeToOfferFromFirebase(callback) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'settings', 'offer');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    }, (err) => {
      console.warn('Offer snapshot error:', err);
    });
  } catch (err) {
    console.warn('Offer snapshot setup failed:', err);
    return () => {};
  }
}

export async function getDefaultOfferFromFirebase() {
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'default_offer');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Error fetching Default Offer from Firebase:', err);
    return null;
  }
}

export async function saveDefaultOfferToFirebase(defaultOfferData) {
  if (!db) return false;
  try {
    const docRef = doc(db, 'settings', 'default_offer');
    await setDoc(docRef, { ...defaultOfferData, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('Error saving Default Offer to Firebase:', err);
    return false;
  }
}



