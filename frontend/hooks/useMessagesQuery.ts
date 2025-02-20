import { getMessages } from "@/api/messages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useWebsocket from "./useWebsocket";
import { wsUrl } from "@/api/utils";

export interface Message {
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

export const useMessagesQuery = (conversationId: string, token: string) => {
  const queryClient = useQueryClient();

  const fetchMessages = async (): Promise<Message[]> => {
    const messages = await getMessages(Number(conversationId), token);
    return messages;
  };

  const websocket = useWebsocket({
    url: `${wsUrl}/ws/${conversationId}`,
    token: token || "", // Pass an empty string if token is not available
  });

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: fetchMessages,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // // Mutation for adding new messages
  // const addMessageMutation = useMutation({
  //   mutationFn: async (newMessage: Omit<Message, "message_id">) => {
  //     // API call to add message
  //     const response = await fetch(`/api/conversations/${conversationId}/messages`, {
  //       method: "POST",
  //       body: JSON.stringify(newMessage),
  //     });
  //     const savedMessage = await response.json();

  //     return savedMessage;
  //   },
  //   onSuccess: (newMessage) => {
  //     // Update React Query cache
  //     queryClient.setQueryData(["messages", conversationId], (old: Message[] | undefined) => [
  //       ...(old || []),
  //       newMessage,
  //     ]);
  //   },
  // });

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    // addMessage: addMessageMutation.mutate,
    // isAddingMessage: addMessageMutation.isPending,
    websocket,
  };
};
