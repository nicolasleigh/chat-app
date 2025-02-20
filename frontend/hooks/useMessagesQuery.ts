import { getMessages } from "@/api/messages";
import { wsUrl } from "@/api/utils";
import { useQuery } from "@tanstack/react-query";
import useWebsocket from "./useWebsocket";

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

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    websocket,
  };
};
