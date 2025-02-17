"use client";

import { getMessages, markReadMessage } from "@/api/messages";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useConversation from "@/hooks/useConversation";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect } from "react";
import CallRoom from "./CallRoom";
import Message from "./Message";
import { wsUrl } from "@/api/utils";
import useWebsocket from "@/hooks/useWebsocket";

type Props = {
  members: {
    // lastSeenMessageId?: Id<"messages">;
    // username?: string;
    // [key: string]: unknown;
    other_member_id: number;
    other_member_username: string;
    other_member_email: string;
    other_member_image_url: string;
    other_member_last_message_id: number | null;
    conversation_id: number;
    conversation_name: string | null;
    is_group: boolean;
    other_member_last_seen_message_id: number | null;
  }[];
  callType: "audio" | "video" | null;
  setCallType: Dispatch<SetStateAction<"audio" | "video" | null>>;
  currentUserId: number;
};

export default function Body({ members, callType, setCallType, currentUserId }: Props) {
  const { conversationId: id } = useConversation();
  const conversationId = parseInt(id);

  const queryClient = useQueryClient();
  const websocket = useWebsocket({ url: `${wsUrl}/ws/${currentUserId}/${conversationId}` });

  const { data: messages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => {
      return getMessages(conversationId);
    },
  });

  // console.log("messages", messages);

  // const { mutate: markRead } = useMutationState(api.conversation.markRead);
  const { mutate: markRead } = useMutation({
    mutationFn: ({
      conversation_id,
      last_seen_message_id,
    }: {
      conversation_id: number;
      last_seen_message_id: number;
    }) => {
      return markReadMessage({ conversation_id, last_seen_message_id, member_id: currentUserId });
    },
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      markRead({
        conversation_id: conversationId,
        last_seen_message_id: messages[0].message_id,
      });
    }
  }, [messages?.length, conversationId, markRead]);

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const queryKey = ["messages", conversationId];
        queryClient.invalidateQueries({ queryKey });
        console.log(data);
      };

      return () => {
        websocket.close();
      };
    }
  }, [websocket, queryClient, currentUserId, conversationId]);

  const formatSeenBy = (names: string[]) => {
    switch (names.length) {
      case 1:
        return <p className='text-muted-foreground text-sm text-right'>{`Seen by ${names[0]}`}</p>;
      case 2:
        return <p className='text-muted-foreground text-sm text-right'>{`Seen by ${names[0]} and ${names[1]}`}</p>;
      default:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className='text-muted-foreground text-sm text-right'>{`Seen by ${names[0]}, ${names[1]}, and ${names.length - 2} more`}</p>
              </TooltipTrigger>
              <TooltipContent>
                <ul>
                  {names.map((name, index) => {
                    return <li key={index}>{name}</li>;
                  })}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  const getSeenMessage = (message_id: number) => {
    const seenUsers = members
      .filter((member) => member.other_member_last_seen_message_id === message_id)
      .map((user) => (user.other_member_username ? user.other_member_username.split(" ")[0] : ""));

    if (seenUsers.length === 0) return undefined;

    return formatSeenBy(seenUsers);
  };

  return (
    <div className='flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar'>
      {!callType ? (
        messages?.map(
          (
            { content, image_url: senderImage, username: senderName, user_id: senderId, created_at, message_id, type },
            index
          ) => {
            const isCurrentUser = currentUserId === senderId;
            const lastByUser = messages[index - 1]?.user_id === messages[index].user_id;

            const seenMessage = isCurrentUser ? getSeenMessage(message_id) : undefined;

            return (
              <Message
                key={message_id}
                fromCurrentUser={isCurrentUser}
                senderImage={senderImage}
                senderName={senderName}
                lastByUser={lastByUser}
                content={content}
                createdAt={created_at}
                type={type}
                seen={seenMessage}
              />
            );
          }
        )
      ) : (
        <CallRoom
          audio={callType === "audio" || callType === "video"}
          video={callType === "video"}
          handleDisconnect={() => setCallType(null)}
        />
      )}
    </div>
  );
}
