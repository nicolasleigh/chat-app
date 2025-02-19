import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIndexedDb } from "./useIndexedDb";

export const useMessagesStore = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();

  const { indexedDb, isConnecting, isDbReady } = useIndexedDb(userId, undefined, {
    async upgrade(database) {
      if (!database.objectStoreNames.contains("messages")) {
        const userObjectStore = database.createObjectStore("messages", {
          keyPath: "id",
          autoIncrement: true,
        });

        // userObjectStore.createIndex("name", "name", { unique: false });
      }
    },
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery(
    // <
    //   Array<{
    //     userId: string;
    //     name: string;
    //   }>
    // >
    {
      queryKey: ["user-message-store"],
      queryFn: async () => {
        try {
          if (!indexedDb) {
            return [];
          }
          const messages = await indexedDb.getAll("messages");
          return messages || [];
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      enabled: isDbReady,
    }
  );

  const { mutateAsync: addMessage, isPending: isAddMessagePending } = useMutation({
    mutationFn: async (message: object) => {
      if (!indexedDb) {
        throw new Error("USER STORE NOT READY");
      }
      await indexedDb.add("messages", {
        message: message,
      });
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["user-message-store"],
      });
    },
  });

  // const { mutateAsync: deleteMessage, isPending: isDeleteMessagePending } = useMutation({
  //   mutationFn: async (id: string) => {
  //     if (!indexedDb) {
  //       throw new Error("USER STORE NOT READY");
  //     }
  //     await indexedDb.delete("messages", id);
  //   },
  //   onSuccess() {
  //     queryClient.invalidateQueries({
  //       queryKey: ["user-message-store"],
  //     });
  //   },
  // });

  return {
    messages: messages || [],
    isLoading: isConnecting || isMessagesLoading,
    isReady: isDbReady,
    addMessage,
    isAddMessagePending,
  };
};
