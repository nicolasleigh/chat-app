"use client";

import ItemList from "@/components/shared/item-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import DMConversationItem from "./_components/DMConversationItem";

export default function ConversationsLayout({ children }: { children: ReactNode }) {
  const conversations = useQuery(api.conversations.get);
  return (
    <>
      <ItemList title='Conversations'>
        {conversations ? (
          conversations.length === 0 ? (
            <p className='w-full h-full flex items-center justify-center'>No conversations found</p>
          ) : (
            conversations.map((conv) => {
              return conv.conversation.isGroup ? null : (
                <DMConversationItem
                  key={conv.conversation._id}
                  id={conv.conversation._id}
                  username={conv.otherMember?.username || ""}
                  imageUrl={conv.otherMember?.imageUrl || ""}
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
