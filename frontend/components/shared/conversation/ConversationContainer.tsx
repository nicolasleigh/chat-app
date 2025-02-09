import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

export default function ConversationContainer({ children }: { children: ReactNode }) {
  // vh doesn't work on IOS, so we use svh
  return <Card className='w-full h-[calc(100svh-32px)] lg:h-full p-2 flex flex-col gap-2'>{children}</Card>;
}
