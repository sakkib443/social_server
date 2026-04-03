import { Comment } from './comment.model';
import { CommentLike } from './commentLike.model';
import { Post } from '../post/post.model';
import { CreateCommentInput } from './comment.validation';

export const commentService = {
  // Create a comment on a post
  async createComment(postId: string, userId: string, input: CreateCommentInput) {
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    const comment = await Comment.create({
      content: input.content,
      author: userId,
      post: postId,
    });

    await comment.populate('author', 'firstName lastName email avatar');

    return comment;
  },

  // Create a reply to a comment
  async createReply(postId: string, commentId: string, userId: string, input: CreateCommentInput) {
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw { status: 404, message: 'Comment not found' };
    }

    // Ensure the parent comment belongs to the post
    if (parentComment.post.toString() !== postId) {
      throw { status: 400, message: 'Comment does not belong to this post' };
    }

    const reply = await Comment.create({
      content: input.content,
      author: userId,
      post: postId,
      parent: commentId,
    });

    await reply.populate('author', 'firstName lastName email avatar');

    return reply;
  },

  // Get all comments for a post (top-level only)
  async getPostComments(postId: string, userId: string | null) {
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({ post: postId, parent: null })
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName email avatar')
      .lean();

    // Add like counts and replies count
    const commentsWithMeta = await Promise.all(
      comments.map(async (comment) => {
        const likeCount = await CommentLike.countDocuments({ comment: comment._id });
        const replyCount = await Comment.countDocuments({ parent: comment._id });
        const isLikedByMe = userId
          ? await CommentLike.exists({ comment: comment._id, user: userId })
          : false;

        return {
          ...comment,
          _count: {
            likes: likeCount,
            replies: replyCount,
          },
          isLikedByMe: !!isLikedByMe,
        };
      })
    );

    return commentsWithMeta;
  },

  // Get replies for a comment
  async getCommentReplies(commentId: string, userId: string | null) {
    const replies = await Comment.find({ parent: commentId })
      .sort({ createdAt: 1 })
      .populate('author', 'firstName lastName email avatar')
      .lean();

    const repliesWithMeta = await Promise.all(
      replies.map(async (reply) => {
        const likeCount = await CommentLike.countDocuments({ comment: reply._id });
        const isLikedByMe = userId
          ? await CommentLike.exists({ comment: reply._id, user: userId })
          : false;

        return {
          ...reply,
          _count: {
            likes: likeCount,
            replies: 0, // No nested replies beyond first level
          },
          isLikedByMe: !!isLikedByMe,
        };
      })
    );

    return repliesWithMeta;
  },

  // Delete a comment (and its replies)
  async deleteComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw { status: 404, message: 'Comment not found' };
    }

    if (comment.author.toString() !== userId) {
      throw { status: 403, message: 'You can only delete your own comments' };
    }

    // Delete all replies
    const replyIds = await Comment.find({ parent: commentId }).distinct('_id');
    
    // Delete likes on replies
    await CommentLike.deleteMany({ comment: { $in: replyIds } });
    
    // Delete replies
    await Comment.deleteMany({ parent: commentId });

    // Delete likes on the comment
    await CommentLike.deleteMany({ comment: commentId });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return { success: true };
  },

  // Toggle like on a comment
  async toggleLike(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw { status: 404, message: 'Comment not found' };
    }

    const existingLike = await CommentLike.findOne({ comment: commentId, user: userId });

    if (existingLike) {
      await CommentLike.findByIdAndDelete(existingLike._id);
      const likeCount = await CommentLike.countDocuments({ comment: commentId });
      return { liked: false, likeCount };
    } else {
      await CommentLike.create({ comment: commentId, user: userId });
      const likeCount = await CommentLike.countDocuments({ comment: commentId });
      return { liked: true, likeCount };
    }
  },

  // Get users who liked a comment
  async getLikers(commentId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const likes = await CommentLike.find({ comment: commentId })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email avatar')
      .lean();

    const users = likes.map((like) => like.user);
    const total = await CommentLike.countDocuments({ comment: commentId });

    return {
      users,
      total,
      hasMore: page * limit < total,
    };
  },

  // Get comment count for a post
  async getCommentCount(postId: string) {
    return await Comment.countDocuments({ post: postId });
  },
};
