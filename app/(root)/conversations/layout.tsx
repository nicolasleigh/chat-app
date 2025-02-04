"use client";

import ItemList from "@/components/shared/item-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import DMConversationItem from "./_components/DMConversationItem";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupConversationItem from "./_components/GroupConversationItem";

export default function ConversationsLayout({ children }: { children: ReactNode }) {
  const conversations = useQuery(api.conversations.get);
  return (
    <>
      <ItemList title='Conversations' action={<CreateGroupDialog />}>
        {conversations ? (
          conversations.length === 0 ? (
            <p className='w-full h-full flex items-center justify-center'>No conversations found</p>
          ) : (
            conversations.map((conv) => {
              return conv.conversation.isGroup ? (
                <GroupConversationItem
                  key={conv.conversation._id}
                  id={conv.conversation._id}
                  name={conv.conversation.name || ""}
                  lastMessageContent={conv.lastMessage?.content}
                  lastMessageSender={conv.lastMessage?.sender}
                />
              ) : (
                <DMConversationItem
                  key={conv.conversation._id}
                  id={conv.conversation._id}
                  username={conv.otherMember?.username || ""}
                  imageUrl={conv.otherMember?.imageUrl || ""}
                  lastMessageContent={conv.lastMessage?.content}
                  lastMessageSender={conv.lastMessage?.sender}
                />
              );
            })
          )
        ) : (
          <Loader2 />
        )}
      </ItemList>
      {children}
    </>
  );
}
