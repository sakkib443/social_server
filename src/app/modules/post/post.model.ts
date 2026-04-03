import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  isPrivate: boolean;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [5000, 'Post content cannot exceed 5000 characters'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isPrivate: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Custom validation: either content or imageUrl must be present
postSchema.pre('validate', function () {
  if (!this.content && !this.imageUrl) {
    this.invalidate('content', 'Either content or image is required');
  }
});

export const Post = mongoose.model<IPost>('Post', postSchema);
