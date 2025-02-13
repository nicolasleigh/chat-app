"use client";

// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
import useConversation from "@/hooks/useConversation";
// import { usePaginatedQuery } from "convex/react";
import Message from "./Message";
import useMutationState from "@/hooks/useMutationState";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CallRoom from "./CallRoom";
import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/messages";
import { useParams } from "next/navigation";

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
  }[];
  callType: "audio" | "video" | null;
  setCallType: Dispatch<SetStateAction<"audio" | "video" | null>>;
  currentUserId: number;
};

export default function Body({ members, callType, setCallType, currentUserId }: Props) {
  const { conversationId: id } = useConversation();

  const conversationId = parseInt(id);

  // const messages = useQuery(api.messages.get, {
  //   id: conversationId as Id<"conversations">,
  // });

  // const { results: messages } = usePaginatedQuery(
  //   api.messages.get,
  //   { id: conversationId as Id<"conversations"> },
  //   { initialNumItems: 5 }
  // );

  const { data: messages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => {
      return getMessages(conversationId);
    },
  });

  // console.log("messages", messages);

  // const { mutate: markRead } = useMutationState(api.conversation.markRead);

  // useEffect(() => {
  //   if (messages && messages.length > 0) {
  //     markRead({
  //       conversationId,
  //       messageId: messages[0].message._id,
  //     });
  //   }
  // }, [messages?.length, conversationId, markRead]);

  // const formatSeenBy = (names: string[]) => {
  //   switch (names.length) {
  //     case 1:
  //       return <p className='text-muted-foreground text-sm text-right'>{`Seen by ${names[0]}`}</p>;
  //     case 2:
  //       return <p className='text-muted-foreground text-sm text-right'>{`Seen by ${names[0]} and ${names[1]}`}</p>;
  //     default:
  //       return (
  //         <TooltipProvider>
  //           <Tooltip>
  //             <TooltipTrigger>
  //               <p className='text-muted-foreground text-sm text-right'>{`Seen by ${names[0]}, ${names[1]}, and ${names.length - 2} more`}</p>
  //             </TooltipTrigger>
  //             <TooltipContent>
  //               <ul>
  //                 {names.map((name, index) => {
  //                   return <li key={index}>{name}</li>;
  //                 })}
  //               </ul>
  //             </TooltipContent>
  //           </Tooltip>
  //         </TooltipProvider>
  //       );
  //   }
  // };

  // const getSeenMessage = (messageId: Id<"messages">) => {
  //   const seenUsers = members
  //     .filter((member) => member.lastSeenMessageId === messageId)
  //     .map((user) => (user.username ? user.username.split(" ")[0] : ""));

  //   if (seenUsers.length === 0) return undefined;

  //   return formatSeenBy(seenUsers);
  // };

  return (
    <div className='flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar'>
      {!callType ? (
        messages?.map(
          (
            { content, image_url: senderImage, username: senderName, user_id: senderId, created_at, message_id, type },
            index
          ) => {
            const isCurrentUser = currentUserId === senderId;
            // const lastByUser = messages[index - 1]?.message.senderId === messages[index].message.senderId;

            // const seenMessage = isCurrentUser ? getSeenMessage(message._id) : undefined;

            return (
              <Message
                key={message_id}
                fromCurrentUser={isCurrentUser}
                senderImage={senderImage}
                senderName={senderName}
                // lastByUser={lastByUser}
                content={content}
                createdAt={created_at}
                type={type}
                // seen={seenMessage}
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
