const notAvailable = (name) => () => {
  throw new Error(`Firebase Firestore is disabled. Attempted to call: ${name}`);
};

export const getFirestore = notAvailable('getFirestore');
export const collection = notAvailable('collection');
export const doc = notAvailable('doc');
export const addDoc = notAvailable('addDoc');
export const setDoc = notAvailable('setDoc');
export const updateDoc = notAvailable('updateDoc');
export const deleteDoc = notAvailable('deleteDoc');
export const getDoc = notAvailable('getDoc');
export const getDocs = notAvailable('getDocs');
export const query = notAvailable('query');
export const collectionGroup = notAvailable('collectionGroup');
export const where = notAvailable('where');
export const orderBy = notAvailable('orderBy');
export const limit = notAvailable('limit');
export const startAfter = notAvailable('startAfter');
export const onSnapshot = notAvailable('onSnapshot');
export const serverTimestamp = notAvailable('serverTimestamp');
export const writeBatch = notAvailable('writeBatch');
export const arrayUnion = notAvailable('arrayUnion');
export const arrayRemove = notAvailable('arrayRemove');
export const increment = notAvailable('increment');
export const Timestamp = class { constructor(){ throw new Error('Firebase Firestore is disabled.'); } };
export const GeoPoint = class { constructor(){ throw new Error('Firebase Firestore is disabled.'); } };
export default {};


