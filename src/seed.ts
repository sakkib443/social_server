/* eslint-disable */
// @ts-nocheck
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Models
import { User } from './app/modules/user/user.model';
import { Post } from './app/modules/post/post.model';
import { PostLike } from './app/modules/post/postLike.model';
import { Comment } from './app/modules/comment/comment.model';

const SALT_ROUNDS = 12;

const avatars = [
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/boy-snow-hoodie.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/kitchen-bar.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/jazz.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/bicycle.jpg',
];

const postImages = [
  'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/dessert.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1/samples/food/spices.jpg',
];

const usersData = [
  { firstName: 'Karim', lastName: 'Saif', email: 'karim@socialvillage.com', password: 'Karim1234' },
  { firstName: 'Steve', lastName: 'Jobs', email: 'steve@socialvillage.com', password: 'Steve1234' },
  { firstName: 'Ryan', lastName: 'Roslansky', email: 'ryan@socialvillage.com', password: 'Ryan12345' },
  { firstName: 'Dylan', lastName: 'Field', email: 'dylan@socialvillage.com', password: 'Dylan1234' },
  { firstName: 'Sarah', lastName: 'Chen', email: 'sarah@socialvillage.com', password: 'Sarah1234' },
];

const postContents = [
  "Just had an amazing brainstorming session with the team! Innovation starts with asking the right questions. #Startup #Innovation",
  "The future of technology lies in making it more human, not less. Every interface should feel natural and intuitive. What do you all think?",
  "Beautiful sunset from the office rooftop today. Sometimes you need to step back and appreciate the little things in life.",
  "Excited to announce that our new project is officially launching next week! Stay tuned for something incredible. #Launch #Excited",
  "Reading 'The Lean Startup' for the third time. Every read brings new insights. What's your favorite business book?",
  "Great conversation at the tech conference today about AI ethics. We need to be more responsible with the tools we build.",
  "Working from a cozy cafe today. Change of scenery really helps with creativity. Where's your favorite place to work from?",
  "Just completed a 10k run! Physical fitness is just as important as mental fitness. #Fitness #Health",
  "Sharing some thoughts on the future of remote work. I believe hybrid is the way forward — flexibility with collaboration.",
  "Happy to mentor 3 young entrepreneurs this quarter. Giving back to the community is what makes this journey worthwhile.",
];

const commentContents = [
  "Absolutely love this! Great perspective.",
  "This is so inspiring! Keep up the good work.",
  "I totally agree with your thoughts on this.",
  "Wow, this is beautiful! Where was this taken?",
  "Congratulations! Can't wait to see it.",
  "Well said! More people need to hear this.",
  "This is a great point! Thanks for sharing.",
  "So true! Balance is everything.",
  "Amazing achievement! You're an inspiration.",
  "Love the energy! Keep pushing boundaries.",
];

async function seed() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL not found in .env');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await PostLike.deleteMany({});
    await Comment.deleteMany({});
    console.log('Data cleared');

    // Create users
    console.log('Creating 5 users...');
    const createdUsers = [];
    for (let i = 0; i < usersData.length; i++) {
      const hashedPassword = await bcrypt.hash(usersData[i].password, SALT_ROUNDS);
      const user = await User.create({
        firstName: usersData[i].firstName,
        lastName: usersData[i].lastName,
        email: usersData[i].email,
        password: hashedPassword,
        avatar: avatars[i],
      });
      createdUsers.push(user);
      console.log('  Created user: ' + user.firstName + ' ' + user.lastName + ' (' + user.email + ')');
    }

    // Create posts (2 per user = 10 posts)
    console.log('Creating posts...');
    const createdPosts = [];
    for (let i = 0; i < postContents.length; i++) {
      const authorIndex = i % usersData.length;
      const hasImage = i < 5;
      
      const post = await Post.create({
        content: postContents[i],
        imageUrl: hasImage ? postImages[i] : undefined,
        isPrivate: false,
        author: createdUsers[authorIndex]._id,
      });
      createdPosts.push(post);
      console.log('  Post ' + (i + 1) + ' by ' + createdUsers[authorIndex].firstName);
    }

    // Create likes
    console.log('Creating likes...');
    let likeCount = 0;
    for (const post of createdPosts) {
      const numLikes = 2 + Math.floor(Math.random() * 3);
      const shuffledUsers = [...createdUsers].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numLikes; i++) {
        await PostLike.create({
          post: post._id,
          user: shuffledUsers[i]._id,
        });
        likeCount++;
      }
    }
    console.log('  Created ' + likeCount + ' likes');

    // Create comments
    console.log('Creating comments...');
    let commentCount = 0;
    for (let i = 0; i < createdPosts.length; i++) {
      const numComments = 1 + Math.floor(Math.random() * 2);
      
      for (let j = 0; j < numComments; j++) {
        const otherUsers = createdUsers.filter(u => u._id.toString() !== createdPosts[i].author.toString());
        const commenter = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        
        await Comment.create({
          content: commentContents[(i + j) % commentContents.length],
          post: createdPosts[i]._id,
          author: commenter._id,
        });
        commentCount++;
      }
    }
    console.log('  Created ' + commentCount + ' comments');

    console.log('\n====== SEED COMPLETE ======');
    console.log('  Users: ' + createdUsers.length);
    console.log('  Posts: ' + createdPosts.length);
    console.log('  Likes: ' + likeCount);
    console.log('  Comments: ' + commentCount);
    console.log('\nLogin Credentials:');
    usersData.forEach(u => {
      console.log('  ' + u.firstName + ' ' + u.lastName + ': ' + u.email + ' / ' + u.password);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
