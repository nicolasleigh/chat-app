"use client";

import ConversationContainer from "@/components/shared/conversation/ConversationContainer";
import { Loader2 } from "lucide-react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import React, { useEffect, useState } from "react";
import RemoveFriendDialog from "./_components/dialogs/RemoveFriendDialog";
import DeleteGroupDialog from "./_components/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/dialogs/LeaveGroupDialog";
import { useQuery } from "@tanstack/react-query";
import { getConversation } from "@/api/conversations";
import { useSearchParams } from "next/navigation";
import useWebsocket from "@/hooks/useWebsocket";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { wsUrl } from "@/api/utils";

type Props = {
  params: Promise<{ conversationId: number }>;
};

export default function ConversationPage({ params }: Props) {
  const { conversationId } = React.use(params);
  const searchParams = useSearchParams();
  const { token } = useAuthInfo();
  const clerk_id = searchParams.get("clerk_id");
  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => {
      if (!clerk_id) {
        throw new Error("Clerk user not found");
      }
      return getConversation({ conversation_id: conversationId, clerk_id });
    },
  });

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);

  const websocket = useWebsocket({
    url: `${wsUrl}/ws/${conversationId}`,
    token: token || "", // Pass an empty string if token is not available
  });

  useEffect(() => {
    if (!token) {
      console.log("No token available, WebSocket not connected");
    }
  }, [token]);

  return conversation === undefined ? (
    <div className='w-full h-full flex items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin' />
    </div>
  ) : conversation === null ? (
    <p className='w-full h-full flex items-center justify-center'>Conversation not found</p>
  ) : (
    <ConversationContainer>
      <RemoveFriendDialog
        conversationId={conversationId}
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
      />
      <DeleteGroupDialog
        conversationId={conversationId}
        open={deleteGroupDialogOpen}
        setOpen={setDeleteGroupDialogOpen}
        clerkId={clerk_id}
      />
      <LeaveGroupDialog conversationId={conversationId} open={leaveGroupDialogOpen} setOpen={setLeaveGroupDialogOpen} />
      <Header
        name={
          (conversation[0]?.is_group ? conversation[0].conversation_name : conversation[0].other_member_username) || ""
        }
        imageUrl={conversation[0].is_group ? undefined : conversation[0].other_member_image_url}
        options={
          conversation[0].is_group
            ? [
                { label: "Leave group", destructive: false, onClick: () => setLeaveGroupDialogOpen(true) },
                { label: "Delete group", destructive: true, onClick: () => setDeleteGroupDialogOpen(true) },
              ]
            : [{ label: "Remove friend", destructive: true, onClick: () => setRemoveFriendDialogOpen(true) }]
        }
        setCallType={setCallType}
      />
      <Body
        members={conversation}
        callType={callType}
        setCallType={setCallType}
        currentUserId={conversation[0].current_user_id}
        websocket={websocket}
      />
      <ChatInput sender_id={conversation[0].current_user_id} websocket={websocket} />
    </ConversationContainer>
  );
}
