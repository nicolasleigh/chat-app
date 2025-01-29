import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function useConversation() {
  const params = useParams();

  const conversationId = useMemo(() => params?.conversationId || "", [params?.conversationId]);

  const isActive = useMemo(() => !!conversationId, [conversationId]);
  return { isActive, conversationId };
}
