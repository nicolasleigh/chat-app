import { openDB } from "idb";

// Create and initialize the database
const initDB = async (dbName: string, conversationId: string) => {
  if (!dbName) return;
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(`conversation_${conversationId}`)) {
        db.createObjectStore(`conversation_${conversationId}`, { keyPath: "message_id" });
      }
    },
  });
  return db;
};

// Store Data
export const storeDataInIndexedDB = async (dbName: string, conversationId: string, data: any[]) => {
  const db = await initDB(dbName, conversationId);
  if (!db) return;
  const tx = db.transaction(`conversation_${conversationId}`, "readwrite");
  const store = tx.objectStore(`conversation_${conversationId}`);

  data.forEach((item) => {
    store.put(item); // Store the object
  });

  await tx.done; // Wait until transaction is completed
  console.log("Data stored successfully in IndexedDB.");
};

// Retrieve Data
export const getDataFromIndexedDB = async (dbName: string, conversationId: string): Promise<any[]> => {
  const db = await initDB(dbName, conversationId);
  if (!db) return [];
  const store = db
    .transaction(`conversation_${conversationId}`, "readonly")
    .objectStore(`conversation_${conversationId}`);
  const allData = await store.getAll();
  return allData;
};
