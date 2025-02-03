"use client";

import ConversationContainer from "@/components/shared/conversation/ConversationContainer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import React from "react";

type Props = {
  params: Promise<{ conversationId: Id<"conversations"> }>;
};

export default function ConversationPage({ params }: Props) {
  const { conversationId } = React.use(params);
  const conversation = useQuery(api.conversation.get, { id: conversationId });

  return conversation === undefined ? (
    <div className='w-full h-full flex items-center justify-center'>
      <Loader2 className='h-8 w-8' />
    </div>
  ) : conversation === null ? (
    <p className='w-full h-full flex items-center justify-center'>Conversation not found</p>
  ) : (
    <ConversationContainer>
      <Header
        name={conversation.isGroup ? conversation.name : conversation.otherMember.username || ""}
        imageUrl={conversation.isGroup ? undefined : conversation.otherMember.imageUrl}
      />
      <Body />
      <ChatInput />
    </ConversationContainer>
  );
}
