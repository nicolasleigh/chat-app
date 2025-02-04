import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FilePreview({ url }: { url: string }) {
  return (
    <Link href={url} target='_blank'>
      <Button variant='secondary'>
        <ExternalLink className='mr-2 h-4 w-4' /> Open File
      </Button>
    </Link>
  );
}
