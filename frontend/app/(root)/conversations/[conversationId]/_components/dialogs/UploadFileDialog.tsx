"use client";

import Uploader from "@/frontend/components/shared/uploader";
import { Button } from "@/frontend/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/frontend/components/ui/form";
import { api } from "@/frontend/convex/_generated/api";
import useConversation from "@/hooks/useConversation";
import useMutationState from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConvexError } from "convex/values";
import { File, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  open: boolean;
  toggle: (newState: boolean) => void;
  type: "imageUploader" | "file";
};

const uploadFileSchema = z.object({
  files: z.string().array().min(1, { message: "You must select at least one file" }),
});

export default function UploadFileDialog({ open, toggle, type }: Props) {
  const form = useForm<z.infer<typeof uploadFileSchema>>({
    resolver: zodResolver(uploadFileSchema),
    defaultValues: {
      files: [],
    },
  });

  const { conversationId } = useConversation();

  const files = form.watch("files");

  const { mutate: createMessage, pending } = useMutationState(api.message.create);

  const handleSubmit = async (values: z.infer<typeof uploadFileSchema>) => {
    createMessage({
      conversationId,
      type,
      content: values.files,
    })
      .then(() => {
        form.reset();
        toggle(false);
      })
      .catch((error) => {
        toast.error(error instanceof ConvexError ? error.data : "Unexpected error");
      });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => toggle(open)}>
      <DialogTrigger asChild>
        <Button size='icon' variant='outline'>
          {type === "imageUploader" ? <Image /> : <File />}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            {type === "imageUploader" ? "Upload images and videos!" : "Upload images, videos, audio, and PDFs!"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name='files'
              render={() => {
                return (
                  <FormItem>
                    <FormControl>
                      <div className='py-4 '>
                        <Uploader type={type} onChange={(urls) => form.setValue("files", [...files, ...urls])} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <DialogFooter>
              <Button disabled={!files.length || pending} type='submit'>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
