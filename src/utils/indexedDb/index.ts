import { publicKeyCredentialToJSON, jsonToPublicKeyCredential } from './utils';

export const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('storage')) {
        db.createObjectStore('storage', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      console.log('Database opened successfully');
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Error opening database', request.error);
      reject(request.error);
    };
  });

export const setItem = async (itemKey: string, value: any): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction('storage', 'readwrite');
  const store = transaction.objectStore('storage');

  const valueToStore = JSON.stringify(publicKeyCredentialToJSON(value));

  const request = store.put({ key: itemKey, value: valueToStore });

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      console.log(`Item with key '${itemKey}' saved successfully`);
      transaction.oncomplete = () => {
        resolve();
      };
    };

    request.onerror = () => {
      console.error(`Error saving item with key '${itemKey}'`, request.error);
      reject(request.error);
    };
  });
};

export const getItem = async (itemKey: string): Promise<any> => {
  const db = await openDB();
  const transaction = db.transaction('storage', 'readonly');
  const store = transaction.objectStore('storage');
  const request = store.get(itemKey);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      if (request.result) {
        const result = JSON.parse(request.result.value);
        const value = jsonToPublicKeyCredential(result);

        console.log(`Item with key '${itemKey}' retrieved successfully`, value);
        resolve(value);
      } else {
        console.log(`No item found with key '${itemKey}'`);
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error(`Error retrieving item with key '${itemKey}'`, request.error);
      reject(request.error);
    };
  });
};

export const storage = { setItem, getItem };
