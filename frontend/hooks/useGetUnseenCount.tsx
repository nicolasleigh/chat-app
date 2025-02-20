import { getUnseenMessageCount } from "@/api/messages";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export default function useGetUnseenCount() {
  const { userId: clerk_id } = useAuth();
  const { data } = useQuery({
    queryKey: ["unseen_message_count"],
    queryFn: () => {
      if (!clerk_id) {
        throw new Error("User id not found");
      }
      return getUnseenMessageCount({ clerk_id });
    },
    refetchInterval: 1000,
  });
  // const queryClient = useQueryClient();
  // return queryClient.getQueryData(["unseen_message_count"]);
  return data;
}
