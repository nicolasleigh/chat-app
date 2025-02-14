"use client";

import ItemList from "@/components/shared/item-list/ItemList";
import { getAllConversations } from "@/api/conversations";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import DMConversationItem from "./_components/DMConversationItem";
import GroupConversationItem from "./_components/GroupConversationItem";

export default function ConversationsLayout({ children }: { children: ReactNode }) {
  const { userId: clerk_id } = useAuth();
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => {
      if (!clerk_id) {
        throw new Error("User ID not found");
      }
      return getAllConversations({ clerk_id });
    },
  });
  return (
    <>
      <ItemList title='Conversations' action={<CreateGroupDialog />}>
        {conversations ? (
          conversations.length === 0 ? (
            <p className='w-full h-full flex items-center justify-center'>No conversations found</p>
          ) : (
            conversations.map((conv) => {
              return conv[0].is_group ? (
                <GroupConversationItem
                  key={conv[0].conversation_id}
                  id={conv[0].conversation_id}
                  name={conv[0].conversation_name}
                  lastMessageId={conv[0].last_message_id}
                  clerkId={clerk_id || ""}
                />
              ) : (
                <DMConversationItem
                  key={conv[0].conversation_id}
                  id={conv[0].conversation_id}
                  username={conv[0].other_member_username || ""}
                  imageUrl={conv[0].other_member_image_url || ""}
                  clerkId={clerk_id || ""}
                  // unseenCount={conv.unseenCount}
                  lastMessageId={conv[0].last_message_id}
                />
              );
            })
          )
        ) : (
          <Loader2 className='animate-spin' />
        )}
      </ItemList>
      {children}
    </>
  );
}
