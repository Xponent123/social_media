import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z
    .string()
    .nonempty("Thread content cannot be empty")
    .max(280, "Thread cannot be longer than 280 characters"),
  accountId: z.string(),
  image: z.string().url("Invalid image URL").optional(),
});

export const CommentValidation = z.object({
  thread: z
    .string()
    .nonempty("Comment cannot be empty")
    .max(280, "Comment cannot be longer than 280 characters"),
});
