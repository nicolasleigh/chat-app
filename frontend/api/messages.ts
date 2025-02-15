import { z } from "zod";
import { baseUrl } from "./utils";

const getMessagesSchema = z.array(
  z.object({
    user_id: z.number(),
    username: z.string(),
    image_url: z.string(),
    email: z.string(),
    message_id: z.number(),
    conversation_id: z.number(),
    type: z.string(),
    content: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
);
export async function getMessages(conversation_id: number): Promise<z.infer<typeof getMessagesSchema>> {
  const response = await fetch(`${baseUrl}/messages/${conversation_id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  let data = await response.json();
  // TODO: handle error
  data = getMessagesSchema.parse(data);
  return data;
}

type createMessageParams = {
  sender_id: number;
  conversation_id: number;
  type: string;
  content: string;
};
export async function createMessage({ sender_id, conversation_id, content, type }: createMessageParams) {
  const response = await fetch(`${baseUrl}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_id,
      conversation_id,
      content,
      type,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

type markReadMessageParams = {
  last_seen_message_id: number;
  conversation_id: number;
  member_id: number;
};
export async function markReadMessage({ conversation_id, member_id, last_seen_message_id }: markReadMessageParams) {
  const response = await fetch(`${baseUrl}/message/mark_read`, {
    method: "POST",
    body: JSON.stringify({
      conversation_id,
      member_id,
      last_seen_message_id,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: response.status`);
  }
}

const getConversationLastMessageSchema = z.object({
  sender_id: z.number(),
  sender_username: z.string(),
  sender_image_url: z.string(),
  content: z.string(),
  type: z.string(),
});

type getConversationLastMessageParams = {
  message_id: number;
};
export async function getConversationLastMessage({
  message_id,
}: getConversationLastMessageParams): Promise<z.infer<typeof getConversationLastMessageSchema>> {
  const response = await fetch(`${baseUrl}/message/${message_id}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  let data = await response.json();
  try {
    data = getConversationLastMessageSchema.parse(data);
  } catch (error) {
    console.error(error);
  }

  return data;
}

// const getUnseenMessageCountSchema = z.object({});
type getUnseenMessageCountParams = {
  clerk_id: string;
  conversation_id: number;
};
export async function getUnseenMessageCount({
  clerk_id,
  conversation_id,
}: getUnseenMessageCountParams): Promise<number> {
  const response = await fetch(`${baseUrl}/message/unseen/${clerk_id}/${conversation_id}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}
