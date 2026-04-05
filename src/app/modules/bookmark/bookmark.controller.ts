import { Request, Response, NextFunction } from 'express';
import { Bookmark } from './bookmark.model';
import { Post } from '../post/post.model';
import { PostLike } from '../post/postLike.model';
import { Comment } from '../comment/comment.model';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const bookmarkController = {
  // Toggle bookmark
  async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { postId } = req.params as any;

      const existing = await Bookmark.findOne({ user: userId, post: postId as string });
      if (existing) {
        await Bookmark.findByIdAndDelete(existing._id);
        return res.status(200).json({ success: true, message: 'Bookmark removed', data: { bookmarked: false } });
      } else {
        await Bookmark.create({ user: userId, post: postId as string });
        return res.status(201).json({ success: true, message: 'Post bookmarked', data: { bookmarked: true } });
      }
    } catch (error: any) {
      next(error);
    }
  },

  // Get my bookmarked posts
  async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const bookmarks = await Bookmark.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'post',
          populate: { path: 'author', select: 'firstName lastName email avatar' },
        })
        .lean();

      // Build post objects with like/comment counts
      const posts = await Promise.all(
        bookmarks
          .filter((b) => b.post)
          .map(async (b: any) => {
            const post = b.post;
            const likeCount = await PostLike.countDocuments({ post: post._id });
            const commentCount = await Comment.countDocuments({ post: post._id });
            const isLikedByMe = !!(await PostLike.exists({ post: post._id, user: userId }));
            return {
              ...post,
              _count: { likes: likeCount, comments: commentCount },
              isLikedByMe,
              isBookmarked: true,
            };
          })
      );

      return res.status(200).json({ success: true, message: 'Bookmarks', data: { posts } });
    } catch (error: any) {
      next(error);
    }
  },
};
