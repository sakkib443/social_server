import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  author: mongoose.Types.ObjectId;
  imageUrl: string;
  content?: string;
  expiresAt: Date;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    content: { type: String, maxlength: 500 },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

// TTL index - auto-delete after expiry
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: -1 });

export const Story = mongoose.model<IStory>('Story', storySchema);
