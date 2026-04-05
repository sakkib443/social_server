import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string({
        message: 'Comment content is required',
      })
      .min(1, 'Comment cannot be empty')
      .max(2000, 'Comment cannot exceed 2000 characters')
      .trim(),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    content: z
      .string({
        message: 'Reply content is required',
      })
      .min(1, 'Reply cannot be empty')
      .max(2000, 'Reply cannot exceed 2000 characters')
      .trim(),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type CreateReplyInput = z.infer<typeof createReplySchema>['body'];
