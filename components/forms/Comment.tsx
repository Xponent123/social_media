"use client";

import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";

import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
  parentId?: string; // Add this prop for supporting replies to comments
  onCommentSubmitted?: () => void; // Add callback for parent component notification
}

const Comment = ({ 
  threadId, 
  currentUserImg, 
  currentUserId, 
  parentId, // Include in destructuring
  onCommentSubmitted // Include in destructuring
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    // Fix the JSON parsing issue by handling the userId properly
    let parsedUserId;
    
    try {
      // Check if it's already a valid ObjectId string
      if (typeof currentUserId === 'string' && 
          /^[0-9a-fA-F]{24}$/.test(currentUserId)) {
        parsedUserId = currentUserId;
      } else {
        // Try parsing it (handle both JSON string and regular string)
        parsedUserId = JSON.parse(currentUserId);
      }
    } catch (error) {
      // If parsing fails, use the original value
      console.error("Error parsing userId:", error);
      parsedUserId = currentUserId;
    }

    // If this is a reply to a comment, we need to adjust how we add it
    // The threadId is still the original thread, but we need to track the parent comment
    await addCommentToThread(
      threadId,
      values.thread,
      parsedUserId,
      pathname,
      parentId // Pass the parentId to the action
    );

    form.reset();
    
    if (onCommentSubmitted) {
      onCommentSubmitted(); // Call the callback if provided
    } else {
      router.refresh(); // Default behavior if no callback
    }
  };

  return (
    <Form {...form}>
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={form.handleSubmit(onSubmit)} 
        className='bg-bg-primary rounded-xl border border-border shadow-sm p-4 mb-8'
      >
        <div className='flex flex-col gap-3'>
          <h3 className='text-base-semibold text-text-primary bg-gradient-to-r from-[rgba(var(--gradient-1-start),1)] to-[rgba(var(--gradient-1-end),1)] text-transparent bg-clip-text'>
            {parentId ? 'Post your reply' : 'Join the conversation'}
          </h3>
          
          <div className='flex items-start gap-4'>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className='flex-shrink-0 mt-1'
            >
              <Image
                src={currentUserImg}
                alt='Profile image'
                width={36}
                height={36}
                className='rounded-full object-cover border-2 border-accent-primary/20'
              />
            </motion.div>
            
            <FormField
              control={form.control}
              name='thread'
              render={({ field }) => (
                <FormItem className='flex-grow'>
                  <FormControl>
                    <textarea
                      placeholder='Write your thoughts...'
                      className='w-full min-h-24 bg-bg-tertiary border-none rounded-lg p-3 text-text-primary resize-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-200'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className='flex justify-end'>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type='submit'
              className='btn-primary px-6 py-2 flex items-center gap-2'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Posting..." : (
                <>
                  {parentId ? "Reply" : "Comment"}
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.form>
    </Form>
  );
};

export default Comment;
