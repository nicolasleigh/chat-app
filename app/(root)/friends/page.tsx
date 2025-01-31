import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import ItemList from "@/components/shared/item-list/ItemList";

export default function FriendsPage() {
  return (
    <>
      <ItemList title='Friends'>Friends Page</ItemList>
      <ConversationFallback />
    </>
  );
}
