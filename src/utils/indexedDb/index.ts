import { publicKeyCredentialToJSON, jsonToPublicKeyCredential } from './utils';

export const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open('myDatabase', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      // 'storage' Object Store가 없는 경우 생성
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

  // 값이 regCredential일때는 indexdb에 들어 갈 수 있는 값으로 변형해서 넣어 줘야 한다.
  const valueToStore =
    itemKey === 'regCredential' ? JSON.stringify(publicKeyCredentialToJSON(value)) : JSON.stringify(value);

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
  console.log(request);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      if (request.result) {
        const result = JSON.parse(request.result.value);

        // 조건에 따라 변환 작업 수행
        const value = itemKey === 'regCredential' ? jsonToPublicKeyCredential(result) : result;

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

export const clearAll = async (): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction('storage', 'readwrite');
  const store = transaction.objectStore('storage');
  const request = store.clear();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      console.log('All items removed successfully');
      resolve();
    };

    request.onerror = () => {
      console.error('Error removing all items', request.error);
      reject(request.error);
    };
  });
};

export const storage = { setItem, getItem, clearAll };
