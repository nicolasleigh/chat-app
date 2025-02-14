import { z } from "zod";
import { baseUrl } from "./utils";

type getConversationParams = {
  clerk_id: string;
  conversation_id: number;
};
const conversationSchema = z.array(
  z.object({
    current_user_id: z.number(),
    other_member_id: z.number(),
    other_member_username: z.string(),
    other_member_email: z.string(),
    other_member_image_url: z.string(),
    other_member_last_seen_message_id: z.nullable(z.number()),
    conversation_id: z.number(),
    conversation_name: z.nullable(z.string()),
    is_group: z.boolean(),
  })
);
export async function getConversation({
  clerk_id,
  conversation_id,
}: getConversationParams): Promise<z.infer<typeof conversationSchema>> {
  const response = await fetch(`${baseUrl}/conversation/${clerk_id}/${conversation_id}`, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const data = await response.json();
  if (!data || data.length === 0) {
    return [];
  }
  const conv = conversationSchema.parse(data);
  return conv;
}

type getAllConversationsParams = {
  clerk_id: string;
};
const allConversationsSchema = z.array(conversationSchema);
export async function getAllConversations({
  clerk_id,
}: getAllConversationsParams): Promise<z.infer<typeof allConversationsSchema>> {
  const response = await fetch(`${baseUrl}/conversations/${clerk_id}`, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  let data = await response.json();
  if (!data || data.length === 0) {
    return [];
  }
  try {
    data = allConversationsSchema.parse(data);
  } catch (error) {
    console.error("Schema validation error:", error);
  }

  return data;
}

type createGroupParams = {
  member_id_arr: number[];
  name: string;
  clerk_id: string;
};
export async function createGroup({ member_id_arr, name, clerk_id }: createGroupParams) {
  const response = await fetch(`${baseUrl}/group/create/${clerk_id}`, {
    method: "POST",
    body: JSON.stringify({
      member_id_arr,
      name,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
}
