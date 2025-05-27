"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  userId: string;
  userImage: string;
}

function PostThread({ userId, userImage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(e.target.value.length);
    form.setValue("thread", e.target.value);
  };

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    try {
      setIsSubmitting(true);

      await createThread({
        text: values.thread,
        author: userId,
        communityId: organization ? organization.id : null,
        path: pathname,
      });

      // Reset form and state
      form.reset();
      setCharacterCount(0);
      
      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col gap-8 mt-8 w-full max-w-xl"
      >
        <div className="bg-bg-primary rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent-primary/20 bg-bg-tertiary">
                {userImage && (
                  <Image
                    src={userImage}
                    alt="Profile image"
                    fill
                    sizes="40px"
                    priority
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="thread"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="text-base-semibold text-text-primary">
                    <span className="bg-gradient-to-r from-[rgba(var(--gradient-1-start),1)] to-[rgba(var(--gradient-1-end),1)] text-transparent bg-clip-text">
                      Share your thoughts
                    </span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      rows={4}
                      placeholder="What's happening?"
                      className="resize-none bg-bg-tertiary/30 border-none rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent-primary/30 transition-all duration-200 text-base-regular w-full"
                      {...field}
                      onChange={handleTextChange}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <FormMessage />
                    <span className={characterCount > 280 ? "text-red-500" : ""}>
                      {characterCount}/280
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons - removed image upload button */}
          <div className="flex items-center mt-4 gap-2 border-t border-border pt-4">
            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary ml-auto flex items-center gap-2 px-5 py-2"
              disabled={isSubmitting || characterCount === 0 || characterCount > 280}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Post</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Community Information */}
        {organization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 rounded-lg bg-bg-tertiary/30 p-3"
          >
            <Image
              src={organization.imageUrl}
              alt={organization.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <p className="text-text-secondary text-small-medium">
              Posting in{" "}
              <span className="text-accent-primary">{organization.name}</span>
            </p>
          </motion.div>
        )}
      </form>
    </Form>
  );
}

export default PostThread;
