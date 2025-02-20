// import { useQuery } from "@tanstack/react-query";
// import { type OpenDBCallbacks, type DBSchema, openDB } from "idb";

// export const useIndexedDb = <DBTypes extends DBSchema | unknown = unknown>(
//   name: string,
//   version?: number,
//   config?: OpenDBCallbacks<DBTypes>
// ) => {
//   const {
//     data: indexedDb,
//     isLoading: isConnecting,
//     isSuccess: isDbReady,
//   } = useQuery({
//     queryKey: ["indexed-db"],
//     queryFn: async () => {
//       try {
//         const db = await openDB(name, version, config);
//         return db;
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     },
//     staleTime: Infinity,
//   });

//   return {
//     indexedDb,
//     isConnecting,
//     isDbReady,
//   };
// };

import { openDB, IDBPDatabase } from "idb";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getMessages } from "@/api/messages";

interface Message {
  message_id: number;
  content: string;
  type: string;
  user_id: number;
  username: string;
  image_url: string;
  email: string;
  conversation_id: number;
  created_at: string;
}

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

// Database initialization
const initDB = async (dbName: string, storeName: string) => {
  const version = incrementVersion(dbName);
  const db = await openDB(dbName, version, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "message_id" });
      }
    },
  });
  return db;
};

// Custom hook for managing IndexedDB operations
const useIndexedDB = (dbName: string, storeName: string) => {
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  useEffect(() => {
    const setup = async () => {
      const database = await initDB(dbName, storeName);
      setDb(database);
    };
    setup();

    return () => {
      db?.close();
    };
  }, [dbName, storeName]);

  return db;
};

// Custom hook combining React Query and IndexedDB
export const useMessages = (userId: string, conversationId: string, token: string) => {
  const queryClient = useQueryClient();
  const db = useIndexedDB(userId, `conversation_${conversationId}`);
  // Get messages from IndexedDB
  const getMessagesFromDB = async (): Promise<Message[]> => {
    if (!db) return [];
    const tx = db.transaction(`conversation_${conversationId}`, "readonly");
    const store = tx.objectStore(`conversation_${conversationId}`);
    return store.getAll();
  };
  getMessagesFromDB().then((e) => console.log("getMessagesFromDB", e));

  // Fetch messages from API
  const fetchMessages = async (): Promise<Message[]> => {
    const messages = await getMessages(Number(conversationId), token);

    // Store in IndexedDB
    if (db) {
      const tx = db.transaction(`conversation_${conversationId}`, "readwrite");
      const store = tx.objectStore(`conversation_${conversationId}`);
      for (const message of messages) {
        await store.put(message);
      }
      console.log("msg in useIndexedDB", messages);
      await tx.done;
    }

    return messages;
  };

  // // Get messages from IndexedDB
  // const getMessagesFromDB = async (): Promise<Message[]> => {
  //   if (!db) return [];
  //   const tx = db.transaction(`conversation_${conversationId}`, "readonly");
  //   const store = tx.objectStore(`conversation_${conversationId}`);
  //   return store.getAll();
  // };

  // React Query hook with IndexedDB integration
  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: fetchMessages,
    // initialData: async () => {
    //   return await getMessagesFromDB();
    // },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Mutation for adding new messages
  const addMessageMutation = useMutation({
    mutationFn: async (newMessage: Omit<Message, "message_id">) => {
      // API call to add message
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify(newMessage),
      });
      const savedMessage = await response.json();

      // Store in IndexedDB
      if (db) {
        const tx = db.transaction(`conversation_${conversationId}`, "readwrite");
        const store = tx.objectStore(`conversation_${conversationId}`);
        await store.put(savedMessage);
        await tx.done;
      }

      return savedMessage;
    },
    onSuccess: (newMessage) => {
      // Update React Query cache
      queryClient.setQueryData(["messages", conversationId], (old: Message[] | undefined) => [
        ...(old || []),
        newMessage,
      ]);
    },
  });

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addMessage: addMessageMutation.mutate,
    isAddingMessage: addMessageMutation.isPending,
  };
};
