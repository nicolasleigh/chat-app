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
