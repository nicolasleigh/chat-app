import { create } from "zustand";

interface MessageStore {
  messages: {
    type: string;
    content: string;
    conversation_id: number;
    username: string;
    user_id: number;
    image_url: string;
    email: string;
    message_id: number;
    created_at: string;
  }[];
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  // setWebSocket: (ws) => set({ websocket: ws }),
  addMessages: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  fetchMessages: async (getMsgFn) => {
    const data = await getMsgFn();
    set({ messages: data });
  },
}));
