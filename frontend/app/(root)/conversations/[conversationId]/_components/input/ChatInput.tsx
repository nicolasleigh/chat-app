"use client";

import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/frontend/components/ui/form";
import { api } from "@/frontend/convex/_generated/api";
import useConversation from "@/hooks/useConversation";
import useMutationState from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConvexError } from "convex/values";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { SendHorizonal } from "lucide-react";
import { useTheme } from "next-themes";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import MessageActionsPopover from "./MessageActionsProvider";

const chatMessageSchema = z.object({
  content: z.string().min(1, {
    message: "This field can't be empty",
  }),
});

export default function ChatInput() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const { conversationId } = useConversation();
  const { theme } = useTheme();

  const { mutate: createMessage, pending } = useMutationState(api.message.create);
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const content = form.watch("content", "");

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = event.target;

    if (selectionStart !== null) {
      form.setValue("content", value);
      setCursorPosition(selectionStart);
    }
  };

  const insertEmoji = (emoji: string) => {
    const newText = [content.substring(0, cursorPosition), emoji, content.substring(cursorPosition)].join("");

    form.setValue("content", newText);

    setCursorPosition(cursorPosition + emoji.length);
  };

  const handleSubmit = async (values: z.infer<typeof chatMessageSchema>) => {
    createMessage({
      conversationId,
      type: "text",
      content: [values.content],
    })
      .then(() => {
        form.reset();
        textareaRef.current?.focus();
      })
      .catch((error) => {
        toast.error(error instanceof ConvexError ? error.data : "Unexpected error");
      });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Card className='w-full p-2 rounded-lg relative'>
      <div className='absolute bottom-16' ref={emojiPickerRef}>
        <EmojiPicker
          open={emojiPickerOpen}
          theme={theme as Theme}
          onEmojiClick={(emojiDetails) => {
            insertEmoji(emojiDetails.emoji);
            setEmojiPickerOpen(false);
          }}
          lazyLoadEmojis
        />
      </div>
      <div className='flex gap-2 items-end w-full'>
        <MessageActionsPopover setEmojiPickerOpen={setEmojiPickerOpen} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='flex gap-2 items-end w-full'>
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => {
                return (
                  <FormItem className='h-full w-full'>
                    <FormControl>
                      <TextareaAutosize
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            await form.handleSubmit(handleSubmit)();
                          }
                        }}
                        rows={1}
                        maxRows={3}
                        {...field}
                        onChange={handleInputChange}
                        // onClick={handleInputChange}
                        placeholder='Type a message...'
                        className='min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button disabled={pending} size='icon' type='submit'>
              <SendHorizonal />
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
