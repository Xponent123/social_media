"use client";

import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );

    form.reset();
    router.refresh();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='bg-bg-primary rounded-xl border border-border shadow-sm p-4 mb-8'
      >
        <div className='flex flex-col gap-3'>
          <h3 className='text-base-semibold text-text-primary'>Post your reply</h3>

          <div className='flex items-start gap-4'>
            <div className='flex-shrink-0 mt-1'>
              <Image
                src={currentUserImg}
                alt='Profile image'
                width={36}
                height={36}
                className='rounded-full object-cover'
              />
            </div>

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
            <button
              type='submit'
              className='btn-primary px-8'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Posting..." : "Reply"}
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Comment;
