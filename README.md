# SocialVillage — Backend API

A RESTful API server for the SocialVillage social media application, built with Express.js, MongoDB, and TypeScript.

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Express.js v5** | Web framework |
| **TypeScript** | Type safety |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Image storage |
| **Zod v4** | Input validation |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin configuration |
| **express-rate-limit** | Rate limiting |

## 📁 Project Structure

```
src/
├── app/
│   ├── config/          # Environment config
│   ├── middlewares/      # Auth middleware
│   └── modules/
│       ├── auth/        # Register, Login, Google OAuth
│       ├── post/        # CRUD posts, likes
│       ├── comment/     # Comments, replies, likes
│       ├── upload/      # Image upload (Cloudinary)
│       └── user/        # User model & validation
├── app.ts               # Express app configuration
├── server.ts            # Server entry (local dev)
└── index.ts             # Vercel serverless entry
```

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with firstName, lastName, email, password |
| POST | `/api/auth/login` | Login with email & password |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user (protected) |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts (paginated, newest first) |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create post (text/image, public/private) |
| DELETE | `/api/posts/:id` | Delete own post |
| POST | `/api/posts/:id/like` | Toggle like on post |
| GET | `/api/posts/:id/likers` | Get users who liked a post |

### Comments & Replies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/:postId/comments` | Get comments for a post |
| POST | `/api/posts/:postId/comments` | Create comment |
| DELETE | `/api/posts/:postId/comments/:commentId` | Delete own comment |
| POST | `/api/posts/:postId/comments/:commentId/like` | Toggle like on comment |
| GET | `/api/posts/:postId/comments/:commentId/likers` | Get who liked a comment |
| GET | `/api/posts/:postId/comments/:commentId/replies` | Get replies |
| POST | `/api/posts/:postId/comments/:commentId/replies` | Create reply |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image to Cloudinary |

## 🔒 Security Features

- **JWT Authentication** — Token-based auth with 7-day expiry
- **Password Hashing** — bcryptjs with salt rounds
- **Helmet** — Secure HTTP headers
- **CORS** — Whitelist-based origin control
- **Rate Limiting** — 100 req/15min (API), stricter for auth routes
- **Input Validation** — Zod schemas on all endpoints

## 📐 Database Design Decisions

- **Separate Like Models** (`PostLike`, `CommentLike`) — Better query performance at scale vs embedded arrays
- **Indexes** on `post`, `user`, `createdAt` fields — Efficient queries for millions of records
- **Pagination** — Skip/limit based, prevents loading entire dataset
- **Private/Public Posts** — `$or` query filter: public posts + user's own private posts

## 🚀 Setup & Run

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod
```

## 🌐 Environment Variables

```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://your-client-url.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
NODE_ENV=production
```

## 📦 Deployment

Deployed on **Vercel** as a serverless function.

- **Live URL:** https://social-server-kappa-six.vercel.app
- **Health Check:** https://social-server-kappa-six.vercel.app/health
