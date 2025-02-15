import { getUnseenMessageCount } from "@/api/messages";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// [
//   {
//     "unseen_message_count": 2,
//     "conversation_id": 29
//   },
//   {
//     "unseen_message_count": 3,
//     "conversation_id": 33
//   }
// ]

export default function useNavigation() {
  const pathname = usePathname();
  const { userId: clerk_id } = useAuth();

  // const requestsCount = useQuery(api.requests.count);
  // const conversations = useQuery(api.conversations.get);
  const { data } = useQuery({
    queryKey: ["unseen_message_count"],
    queryFn: () => {
      if (!clerk_id) {
        throw new Error("User id not found");
      }
      return getUnseenMessageCount({ clerk_id });
    },
  });

  const unseenMessagesCount = useMemo(() => {
    return data?.reduce((acc, curr) => {
      return acc + curr.unseen_message_count;
    }, 0);
  }, [data]);

  const paths = useMemo(
    () => [
      {
        name: "Conversations",
        href: "/conversations",
        icon: <MessageSquare />,
        active: pathname.startsWith("/conversations"),
        count: unseenMessagesCount,
      },
      {
        name: "Friends",
        href: "/friends",
        icon: <Users />,
        active: pathname === "/friends",
        // count: requestsCount,
      },
    ],
    [pathname, unseenMessagesCount]
  );
  return paths;
}
