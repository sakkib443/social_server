import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentLike extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
  createdAt: Date;
}

const commentLikeSchema = new Schema<ICommentLike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - user can only like a comment once
commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });
commentLikeSchema.index({ comment: 1 });

export const CommentLike = mongoose.model<ICommentLike>('CommentLike', commentLikeSchema);
