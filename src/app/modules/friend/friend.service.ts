import { FriendRequest } from './friend.model';
import { User } from '../user/user.model';
import mongoose from 'mongoose';

export const friendService = {
  // Send friend request
  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw { status: 400, message: 'Cannot send request to yourself' };
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) throw { status: 404, message: 'User not found' };

    // Check for existing request in either direction
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') throw { status: 400, message: 'Already friends' };
      if (existing.status === 'pending') throw { status: 400, message: 'Request already pending' };
      // If rejected, allow re-sending
      existing.status = 'pending';
      existing.sender = new mongoose.Types.ObjectId(senderId);
      existing.receiver = new mongoose.Types.ObjectId(receiverId);
      await existing.save();
      return existing;
    }

    return await FriendRequest.create({ sender: senderId, receiver: receiverId });
  },

  // Accept friend request
  async acceptRequest(requestId: string, userId: string) {
    const request = await FriendRequest.findById(requestId);
    if (!request) throw { status: 404, message: 'Request not found' };
    if (request.receiver.toString() !== userId) throw { status: 403, message: 'Not your request' };
    if (request.status !== 'pending') throw { status: 400, message: 'Request not pending' };

    request.status = 'accepted';
    await request.save();
    return request;
  },

  // Reject friend request
  async rejectRequest(requestId: string, userId: string) {
    const request = await FriendRequest.findById(requestId);
    if (!request) throw { status: 404, message: 'Request not found' };
    if (request.receiver.toString() !== userId) throw { status: 403, message: 'Not your request' };

    request.status = 'rejected';
    await request.save();
    return request;
  },

  // Get pending requests (received)
  async getPendingRequests(userId: string) {
    return await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .lean();
  },

  // Get sent requests (sent by me, still pending)
  async getSentRequests(userId: string) {
    return await FriendRequest.find({ sender: userId, status: 'pending' })
      .populate('receiver', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .lean();
  },

  // Cancel my own sent request
  async cancelRequest(requestId: string, userId: string) {
    const request = await FriendRequest.findById(requestId);
    if (!request) throw { status: 404, message: 'Request not found' };
    if (request.sender.toString() !== userId) throw { status: 403, message: 'Not your request' };
    if (request.status !== 'pending') throw { status: 400, message: 'Request not pending' };
    await FriendRequest.findByIdAndDelete(requestId);
    return { success: true };
  },

  // Get my friends
  async getFriends(userId: string) {
    const friendships = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    })
      .populate('sender', 'firstName lastName email avatar')
      .populate('receiver', 'firstName lastName email avatar')
      .lean();

    // Extract friend users (not the current user)
    return friendships.map((f) => {
      const friend = f.sender._id.toString() === userId ? f.receiver : f.sender;
      return friend;
    });
  },

  // Get suggested people (not friends, not pending)
  async getSuggestions(userId: string, limit: number = 10) {
    // Get all users who have any relationship with current user
    const relationships = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: { $in: ['pending', 'accepted'] },
    }).lean();

    const excludeIds = new Set<string>();
    excludeIds.add(userId);
    relationships.forEach((r) => {
      excludeIds.add(r.sender.toString());
      excludeIds.add(r.receiver.toString());
    });

    return await User.find({ _id: { $nin: Array.from(excludeIds) } })
      .select('firstName lastName email avatar createdAt')
      .limit(limit)
      .lean();
  },

  // Remove friend
  async removeFriend(userId: string, friendId: string) {
    const result = await FriendRequest.findOneAndDelete({
      $or: [
        { sender: userId, receiver: friendId, status: 'accepted' },
        { sender: friendId, receiver: userId, status: 'accepted' },
      ],
    });
    if (!result) throw { status: 404, message: 'Friendship not found' };
    return { success: true };
  },

  // Get friendship status between two users
  async getStatus(userId: string, targetId: string) {
    const request = await FriendRequest.findOne({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId },
      ],
    }).lean();

    if (!request) return { status: 'none' };
    return {
      status: request.status,
      requestId: request._id,
      isSender: request.sender.toString() === userId,
    };
  },
};
