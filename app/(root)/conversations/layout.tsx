import ItemList from "@/components/shared/item-list/ItemList";
import { ReactNode } from "react";

export default function ConversationsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ItemList title='Conversations'>Conversation page</ItemList>
      {children}
    </>
  );
}
