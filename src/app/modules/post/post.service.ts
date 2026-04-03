import mongoose from 'mongoose';
import { Post, IPost } from './post.model';
import { PostLike } from './postLike.model';
import { Comment } from '../comment/comment.model';
import { CreatePostInput } from './post.validation';
import { User } from '../user/user.model';

export const postService = {
  // Create a new post
  async createPost(userId: string, input: CreatePostInput) {
    const post = await Post.create({
      ...input,
      author: userId,
    });

    // Populate author info
    await post.populate('author', 'firstName lastName email avatar');

    return post;
  },

  // Get all posts with pagination
  async getPosts(userId: string | null, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Build query: public posts + user's own private posts
    const query: any = {
      $or: [
        { isPrivate: false },
        ...(userId ? [{ author: userId, isPrivate: true }] : []),
      ],
    };

    // Get total count
    const total = await Post.countDocuments(query);

    // Get posts with author info
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName email avatar')
      .lean();

    // Get like counts and check if user liked
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await PostLike.countDocuments({ post: post._id });
        const isLikedByMe = userId
          ? await PostLike.exists({ post: post._id, user: userId })
          : false;
        
        // Get comment count
        const commentCount = await Comment.countDocuments({ post: post._id });

        return {
          ...post,
          _count: {
            likes: likeCount,
            comments: commentCount,
          },
          isLikedByMe: !!isLikedByMe,
        };
      })
    );

    return {
      posts: postsWithLikes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  },

  // Get single post by ID
  async getPostById(postId: string, userId: string | null) {
    const post = await Post.findById(postId)
      .populate('author', 'firstName lastName email avatar')
      .lean();

    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    // Check if private post belongs to another user
    if (post.isPrivate && post.author._id.toString() !== userId) {
      throw { status: 403, message: 'Access denied to private post' };
    }

    const likeCount = await PostLike.countDocuments({ post: postId });
    const isLikedByMe = userId
      ? await PostLike.exists({ post: postId, user: userId })
      : false;
    const commentCount = await Comment.countDocuments({ post: postId });

    return {
      ...post,
      _count: {
        likes: likeCount,
        comments: commentCount,
      },
      isLikedByMe: !!isLikedByMe,
    };
  },

  // Delete post
  async deletePost(postId: string, userId: string) {
    const post = await Post.findById(postId);

    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    if (post.author.toString() !== userId) {
      throw { status: 403, message: 'You can only delete your own posts' };
    }

    // Delete associated likes
    await PostLike.deleteMany({ post: postId });
    
    // Delete associated comments and their likes
    const commentIds = await Comment.find({ post: postId }).distinct('_id');
    const { CommentLike } = await import('../comment/commentLike.model');
    await CommentLike.deleteMany({ comment: { $in: commentIds } });
    await Comment.deleteMany({ post: postId });
    
    // Delete the post
    await Post.findByIdAndDelete(postId);

    return { success: true };
  },

  // Toggle like on post
  async toggleLike(postId: string, userId: string) {
    const post = await Post.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Post not found' };
    }

    // Check if already liked
    const existingLike = await PostLike.findOne({ post: postId, user: userId });

    if (existingLike) {
      // Unlike
      await PostLike.findByIdAndDelete(existingLike._id);
      const likeCount = await PostLike.countDocuments({ post: postId });
      return { liked: false, likeCount };
    } else {
      // Like
      await PostLike.create({ post: postId, user: userId });
      const likeCount = await PostLike.countDocuments({ post: postId });
      return { liked: true, likeCount };
    }
  },

  // Get users who liked a post
  async getLikers(postId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const likes = await PostLike.find({ post: postId })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email avatar')
      .lean();

    const users = likes.map((like) => like.user);
    const total = await PostLike.countDocuments({ post: postId });

    return {
      users,
      total,
      hasMore: page * limit < total,
    };
  },
};
