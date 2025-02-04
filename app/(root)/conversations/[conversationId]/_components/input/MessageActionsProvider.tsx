import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { PlusCircle, Smile } from "lucide-react";
import { SetStateAction } from "react";

type Props = {
  setEmojiPickerOpen: (value: SetStateAction<boolean>) => void;
};

export default function MessageActionsProvider({ setEmojiPickerOpen }: Props) {
  return (
    <Popover>
      <PopoverContent className='w-full mb-1 flex flex-col gap-2'>
        <PopoverClose asChild>
          <Button
            variant='outline'
            onClick={() => {
              setEmojiPickerOpen(true);
            }}
            size='icon'
          >
            <Smile />
          </Button>
        </PopoverClose>
      </PopoverContent>
      <PopoverTrigger asChild>
        <Button size='icon' variant='secondary'>
          <PlusCircle />
        </Button>
      </PopoverTrigger>
    </Popover>
  );
}
