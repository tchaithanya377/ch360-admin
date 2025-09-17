const notAvailable = (name) => () => {
  throw new Error(`Firebase Storage is disabled. Attempted to call: ${name}`);
};

export const getStorage = notAvailable('getStorage');
export const ref = notAvailable('ref');
export const uploadBytes = notAvailable('uploadBytes');
export const getDownloadURL = notAvailable('getDownloadURL');
export const deleteObject = notAvailable('deleteObject');
export const listAll = notAvailable('listAll');
export default {};


