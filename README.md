# SocialVillage — Backend API (Node.js + Express)

A RESTful API server for the SocialVillage social media application, built with **Express.js**, **TypeScript**, and **MongoDB**.

## 🌐 Live API
**https://social-server-kappa-six.vercel.app/api**

## 📂 Repositories
- **Frontend:** https://github.com/sakkib443/social_client
- **Backend:** https://github.com/sakkib443/social_server

---

## ✅ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Get all public posts (paginated) |
| POST | `/posts` | Create a new post |
| DELETE | `/posts/:id` | Delete a post |
| POST | `/posts/:id/like` | Toggle like on a post |
| GET | `/posts/:id/likers` | Get users who liked a post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/comments/:postId` | Get comments for a post |
| POST | `/comments` | Create a comment or reply |
| DELETE | `/comments/:id` | Delete a comment |
| POST | `/comments/:id/like` | Toggle like on a comment |
| GET | `/comments/:id/likers` | Get users who liked a comment |

### Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/friends` | Get my friends list |
| GET | `/friends/requests` | Get pending friend requests |
| GET | `/friends/sent` | Get my sent requests |
| GET | `/friends/suggestions` | Get friend suggestions |
| POST | `/friends/request/:userId` | Send friend request |
| PUT | `/friends/accept/:requestId` | Accept friend request |
| PUT | `/friends/reject/:requestId` | Reject friend request |
| DELETE | `/friends/cancel/:requestId` | Cancel sent request |
| DELETE | `/friends/:friendId` | Remove friend |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stories` | Get all stories (grouped by user) |
| POST | `/stories` | Create a story |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookmarks` | Get bookmarked posts |
| POST | `/bookmarks/:postId` | Toggle bookmark |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/image` | Upload image to Cloudinary |

---

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **File Upload:** Cloudinary
- **Validation:** Zod
- **Security:** Helmet, CORS, express-rate-limit
- **Deployment:** Vercel (Serverless)

---

## 🏗️ Project Structure
```
src/
├── app/
│   ├── modules/
│   │   ├── user/           # User model, controller, service, routes
│   │   ├── auth/           # Auth controller, service, routes
│   │   ├── post/           # Post model, controller, service, routes
│   │   ├── comment/        # Comment model, controller, service, routes
│   │   ├── friend/         # FriendRequest model, controller, service, routes
│   │   ├── story/          # Story model, controller, service, routes
│   │   ├── bookmark/       # Bookmark model, controller, service, routes
│   │   └── upload/         # Upload controller, service, routes
│   └── middlewares/
│       └── auth.middleware.ts
├── app.ts                  # Express app setup
└── server.ts               # Server entry point
```

---

## 🗄️ Database Models

- **User** — firstName, lastName, email, password (bcrypt hashed), avatar
- **Post** — content, imageUrl, isPrivate, author (ref: User)
- **PostLike** — post + user (compound unique index)
- **Comment** — content, post, author, parentComment (self-referencing for replies)
- **CommentLike** — comment + user (compound unique index)
- **FriendRequest** — sender, receiver, status (pending/accepted/rejected)
- **Story** — author, imageUrl, expiresAt (TTL index — auto-deletes after 24hrs)
- **Bookmark** — user + post (compound unique index)

---

## 🔒 Security Measures
- JWT tokens for session management
- bcrypt for password hashing (12 salt rounds)
- Helmet for HTTP security headers
- CORS with whitelisted origins
- Rate limiting (100 requests/15min general, 20/min for auth)
- Zod schema validation on all inputs
- Mongoose for MongoDB injection prevention

---

## 🚀 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/sakkib443/social_server.git
cd social_server

# Install dependencies
npm install

# Create .env file with:
# DATABASE_URL=mongodb+srv://...
# JWT_SECRET=your_secret
# CLOUDINARY_CLOUD_NAME=your_cloud
# CLOUDINARY_API_KEY=your_key
# CLOUDINARY_API_SECRET=your_secret

# Run development server
npm run dev
```

Server runs on http://localhost:5000

---

## 📝 Design Decisions

1. **Modular Architecture:** Each feature (User, Post, Comment, etc.) has its own module with separate model, controller, service, and routes files for clean separation of concerns.

2. **Compound Indexes:** Used compound unique indexes on PostLike (post + user) and CommentLike (comment + user) to prevent duplicate likes and enable fast lookups.

3. **TTL Index for Stories:** MongoDB TTL index on `expiresAt` field automatically deletes stories after 24 hours without any cron job.

4. **Pagination:** All list endpoints support pagination with `page` and `limit` query params, designed to handle millions of records.

5. **Lean Queries:** Used `.lean()` for read-only queries to skip Mongoose hydration and improve performance.

---

## 👤 Developer
**Sheikh Sakibul Hasan**  
🌐 https://www.extrainweb.com  
💻 https://github.com/sakkib443
