import mongoose, { Schema, Document } from 'mongoose';

export interface IPostLike extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const postLikeSchema = new Schema<IPostLike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - user can only like a post once
postLikeSchema.index({ user: 1, post: 1 }, { unique: true });
postLikeSchema.index({ post: 1 });

export const PostLike = mongoose.model<IPostLike>('PostLike', postLikeSchema);
