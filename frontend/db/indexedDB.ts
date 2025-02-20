import { openDB, IDBPDatabase } from "idb";

// // Create and initialize the database
// const initDB = async (dbName: string, conversationId: string) => {
//   if (!dbName) return;
//   const db = await openDB(dbName, 1, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains(`conversation_${conversationId}`)) {
//         db.createObjectStore(`conversation_${conversationId}`, { keyPath: "message_id" });
//       }
//     },
//   });
//   return db;
// };

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
  // return allData.sort((a, b) => b.created_at - a.created_at);
  return allData;
};

// ======================== LocalStorage ========================
// LocalStorage key for storing versions
const VERSION_STORAGE_KEY = "indexeddb_versions";

// Load versions from localStorage
const loadVersions = (): { [key: string]: number } => {
  const stored = localStorage.getItem(VERSION_STORAGE_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading database versions:", error);
    return {};
  }
};

// Save versions to localStorage
const saveVersions = (versions: { [key: string]: number }): void => {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
  } catch (error) {
    console.error("Error saving database versions:", error);
  }
};

// Initialize versions from localStorage
const dbVersions = loadVersions();

// Get the current version for a database
const getCurrentVersion = (dbName: string): number => {
  return dbVersions[dbName] || 0;
};

// Update the version for a database
const incrementVersion = (dbName: string): number => {
  const currentVersion = getCurrentVersion(dbName);
  const newVersion = currentVersion + 1;
  dbVersions[dbName] = newVersion;
  saveVersions(dbVersions);
  return newVersion;
};
// ======================== LocalStorage ========================

// Initialize or update the database
const initDB = async (dbName: string, conversationId: string): Promise<IDBPDatabase> => {
  if (!dbName) throw new Error("Database name is required");

  // Get the next version number
  const version = incrementVersion(dbName);

  try {
    const db = await openDB(dbName, version, {
      upgrade(db) {
        // Create the new object store for this conversation
        if (!db.objectStoreNames.contains(`conversation_${conversationId}`)) {
          const store = db.createObjectStore(`conversation_${conversationId}`, {
            keyPath: "message_id",
          });
          store.createIndex("message_id", "message_id", { unique: true });
        }
      },
    });

    return db;
  } catch (error) {
    // If there's an error, we should roll back the version
    dbVersions[dbName] = version - 1;
    saveVersions(dbVersions);
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Helper function to check if an object store exists
const hasObjectStore = async (db: IDBPDatabase, storeName: string): Promise<boolean> => {
  return db.objectStoreNames.contains(storeName);
};

// Reset database versions (useful for testing or recovery)
const resetDatabaseVersions = (): void => {
  localStorage.removeItem(VERSION_STORAGE_KEY);
  Object.keys(dbVersions).forEach((key) => delete dbVersions[key]);
};

// // Example usage function
// export const createConversation = async (dbName: string, conversationId: string) => {
//   const db = await initDB(dbName, conversationId);

//   // Verify the object store was created
//   const storeExists = await hasObjectStore(db, `conversation_${conversationId}`);
//   if (!storeExists) {
//     throw new Error(`Failed to create object store for conversation ${conversationId}`);
//   }

//   return db;
// };

// Export utilities for version management
export const databaseUtils = {
  getCurrentVersion,
  resetDatabaseVersions,
  getStoredVersions: () => ({ ...dbVersions }),
};
