import { Story } from './story.model';

export const storyService = {
  async createStory(userId: string, data: { imageUrl: string; content?: string }) {
    const story = await Story.create({
      author: userId,
      imageUrl: data.imageUrl,
      content: data.content,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await story.populate('author', 'firstName lastName email avatar');
    return story;
  },

  async getStories() {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('author', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Group by author
    const groupedMap = new Map<string, any>();
    stories.forEach((story) => {
      const authorId = (story.author as any)._id.toString();
      if (!groupedMap.has(authorId)) {
        groupedMap.set(authorId, {
          author: story.author,
          stories: [],
        });
      }
      groupedMap.get(authorId).stories.push(story);
    });

    return Array.from(groupedMap.values());
  },

  async deleteStory(storyId: string, userId: string) {
    const story = await Story.findById(storyId);
    if (!story) throw { status: 404, message: 'Story not found' };
    if (story.author.toString() !== userId) throw { status: 403, message: 'Not your story' };
    await Story.findByIdAndDelete(storyId);
    return { success: true };
  },
};
