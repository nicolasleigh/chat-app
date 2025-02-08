import { Avatar, AvatarFallback, AvatarImage } from "@/frontend/components/ui/avatar";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CircleArrowLeft, Phone, Settings, Video } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

type Props = {
  imageUrl?: string;
  name: string;
  options?: {
    label: string;
    destructive: boolean;
    onClick: () => void;
  }[];
  setCallType: Dispatch<SetStateAction<"audio" | "video" | null>>;
};

export default function Header({ imageUrl, name, options, setCallType }: Props) {
  return (
    <Card className='w-full flex rounded-lg items-center p-2 justify-between'>
      <div className='flex items-center gap-2'>
        <Link href='/conversations' className='block lg:hidden'>
          <CircleArrowLeft />
        </Link>
        <Avatar className='h-8 w-8'>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{name.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <h2 className='font-semibold'>{name}</h2>
      </div>
      <div className='flex gap-2'>
        <Button variant='secondary' size='icon' onClick={() => setCallType("audio")}>
          <Phone />
        </Button>
        <Button variant='secondary' size='icon' onClick={() => setCallType("video")}>
          <Video />
        </Button>
        {options ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='icon' variant='secondary'>
                <Settings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {options.map((option, id) => {
                return (
                  <DropdownMenuItem
                    key={id}
                    onClick={option.onClick}
                    className={cn("font-semibold", { "text-destructive": option.destructive })}
                  >
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </Card>
  );
}
