import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .max(5000, 'Post content cannot exceed 5000 characters')
      .optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    isPrivate: z.boolean().default(false),
  }).refine(
    (data) => data.content || data.imageUrl,
    { message: 'Either content or image is required' }
  ),
});

export const getPostsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type GetPostsQuery = z.infer<typeof getPostsSchema>['query'];
