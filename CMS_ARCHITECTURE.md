# CMS Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NEWSDAY CMS SYSTEM                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │   NextAuth.js        │  │   Role-Based Auth    │                │
│  ├──────────────────────┤  ├──────────────────────┤                │
│  │ ✓ Google OAuth       │  │ ✓ Admin Role Check   │                │
│  │ ✓ Credentials Auth   │  │ ✓ Session Validation │                │
│  │ ✓ JWT Sessions       │  │ ✓ Route Protection   │                │
│  └──────────────────────┘  └──────────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
        ┌───────────▼──────────┐   │   ┌───────────▼──────────┐
        │   ADMIN PANEL        │   │   │  PUBLIC BLOG         │
        │   (Protected)        │   │   │  (Public)            │
        └──────────────────────┘   │   └──────────────────────┘
                    │               │               │
        ┌───────────▼──────────────────────────────▼──────────────┐
        │            API ENDPOINTS (RESTful)                      │
        └───────────────────────────────────────────────────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
  ┌──▼───────┐  ┌──▼───────┐  ┌──▼───────┐
  │  Posts   │  │Category  │  │  Tags    │
  │  API     │  │  API     │  │  API     │
  └──┬───────┘  └──┬───────┘  └──┬───────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
        ┌──────────▼──────────┐
        │   MONGODB DATABASE  │
        ├─────────────────────┤
        │ ✓ Posts Collection  │
        │ ✓ Categories        │
        │ ✓ Tags              │
        │ ✓ Users             │
        └─────────────────────┘
```

## Data Flow Diagram

### Post Creation Flow
```
Admin User
    │
    ▼
┌─────────────────────────────────┐
│  /admin/cms/posts/create        │
│  (PostForm Component)           │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Form Validation    │
    │ (Zod Schema)       │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ POST /api/cms/posts│
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Auth Check (Admin)      │
    │ Slug Uniqueness Check   │
    │ Category Validation     │
    │ Tag Validation          │
    └────────┬────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Save to MongoDB    │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Return Success     │
    │ Redirect to List   │
    └────────────────────┘
```

### Post Viewing Flow (Public)
```
Blog Reader
    │
    ▼
┌─────────────────────────────────┐
│  GET /api/cms/posts?status...   │
│  (Public API Call)              │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Query MongoDB      │
    │ Filter by Status   │
    │ Apply Pagination   │
    │ Populate Relations │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Return Posts Array │
    │ + Pagination Info  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ /blog page renders         │
    │ - Display post grid        │
    │ - Show pagination          │
    │ - Filter by category/tags  │
    └────────────────────────────┘
```

## Component Hierarchy

```
                        App (Root)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼────┐        ┌────▼────┐
    │ Layout │         │ Providers│       │ Fonts   │
    └───┬────┘         └────┬────┘        └────┬────┘
        │                   │                   │
        │                   ▼                   │
        │              NextAuth Session         │
        │
        ├─► /admin/cms/* (Protected Routes)
        │   ├─ Dashboard
        │   ├─ Posts Management
        │   │  ├─ PostForm Component
        │   │  ├─ Pagination Component
        │   │  ├─ StatusBadge Component
        │   │  └─ ConfirmDialog Component
        │   ├─ Categories Management
        │   └─ Tags Management
        │
        └─► /blog/* (Public Routes)
            ├─ Blog Listing
            ├─ Single Post
            ├─ Category Posts
            └─ Tag Posts
```

## Database Schema Relationships

```
┌──────────────┐
│    Users     │
├──────────────┤
│ _id          │◄────┐
│ name         │     │
│ email        │     │
│ role         │     │ 1
│ password     │     │
└──────────────┘     │
                     │
                     │
┌──────────────┐     │
│   Posts      │─────┘ (author)
├──────────────┤
│ _id          │
│ title        │
│ slug         │
│ content      │
│ category_id  │─┐
│ tags: []     │ │  ┌──────────────┐
│ author_id    │ │  │ Categories   │
│ status       │ │  ├──────────────┤
│ seo: {...}   │ │  │ _id          │
│ views        │ │  │ name         │
│ createdAt    │ │  │ slug         │
│ updatedAt    │ │  │ description  │
│ publishedAt  │ │  │ parent_id    │
└──────────────┘ │  └──────────────┘
        │        │
        │        └─(many-to-1)
        │
        │ (many-to-many)
        │
        ▼
┌──────────────┐
│    Tags      │
├──────────────┤
│ _id          │
│ name         │
│ slug         │
│ description  │
│ color        │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

## API Request/Response Flow

### Create Post Request
```
Client
   │
   ├─ Method: POST
   ├─ Path: /api/cms/posts
   ├─ Headers: Content-Type: application/json
   ├─ Body: {
   │    title: "Hello World",
   │    content: "...",
   │    category: "cat_id",
   │    tags: ["tag_id"],
   │    status: "published",
   │    seo: {...}
   │ }
   │
   ▼ (Server)
   
   ├─ Verify Session
   ├─ Check Admin Role
   ├─ Validate Input (Zod)
   ├─ Generate Slug
   ├─ Check Slug Uniqueness
   ├─ Verify Category
   ├─ Verify Tags
   ├─ Create Document in MongoDB
   ├─ Populate Relations
   │
   ▼ (Response)
   
   ├─ Status: 201 Created
   ├─ Body: {
   │    success: true,
   │    data: {
   │      _id: "...",
   │      title: "Hello World",
   │      ...
   │    }
   │ }
   │
   ▼ (Client)
   
   Redirect to /admin/cms/posts

```

## File Size & Performance

```
Models:
├─ Post.ts          ~2.5 KB
├─ Tag.ts           ~1.2 KB
└─ Category.ts      ~1.5 KB

API Routes:
├─ posts/route.ts   ~4.5 KB
├─ posts/[id]/route.ts ~5.2 KB
├─ categories/      ~2x route files (~7 KB)
└─ tags/            ~2x route files (~7 KB)

Components:
├─ CmsComponents.tsx ~5.5 KB
├─ PostForm.tsx      ~6.2 KB

Pages:
├─ Admin Pages      ~6x files (~30 KB total)
├─ Public Pages     ~4x files (~20 KB total)

Utils:
└─ cms-utils.ts     ~2.5 KB

Total Size: ~95 KB (minified)
```

## Performance Considerations

### Database Optimization
```
Indexes:
├─ posts.slug (unique)
├─ posts.status
├─ posts.category
├─ posts.tags
├─ posts.createdAt
├─ categories.slug (unique)
├─ categories.name
├─ tags.slug (unique)
└─ tags.name

Query Optimization:
├─ Use .lean() for read-only queries
├─ Population only when needed
├─ Pagination with skip/limit
└─ Batch operations where possible
```

### Frontend Optimization
```
Code Splitting:
├─ Admin routes in separate chunks
├─ Blog routes in separate chunks
├─ Shared components in vendor bundle

Caching:
├─ Static category/tag lists
├─ Database connection pooling
├─ Browser caching headers
└─ Next.js ISR (Incremental Static Regeneration)
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│       Vercel / Hosting Platform     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Next.js App               │  │
│  │  - API Routes               │  │
│  │  - Admin Pages              │  │
│  │  - Blog Pages               │  │
│  └────────────┬─────────────────┘  │
│               │                    │
└───────────────┼────────────────────┘
                │
    ┌───────────▼──────────────┐
    │   MongoDB Atlas Cloud    │
    │  (Production Database)   │
    │  - Backup & Recovery     │
    │  - Auto-Scaling          │
    │  - Connection Pooling     │
    └──────────────────────────┘
```

## Error Handling Flow

```
Client Request
    │
    ▼
┌──────────────────┐
│ Validation Error │ ──► 400 Bad Request
└──────────────────┘    {error: "..."}
    │
    ▼
┌──────────────────┐
│ Auth Error       │ ──► 401 Unauthorized
└──────────────────┘    {error: "..."}
    │
    ▼
┌──────────────────┐
│ Permission Error │ ──► 403 Forbidden
└──────────────────┘    {error: "..."}
    │
    ▼
┌──────────────────┐
│ Not Found Error  │ ──► 404 Not Found
└──────────────────┘    {error: "..."}
    │
    ▼
┌──────────────────┐
│ Server Error     │ ──► 500 Server Error
└──────────────────┘    {error: "..."}
    │
    ▼
│ Success Response │ ──► 200/201 OK
└──────────────────┘    {success: true, data: {...}}
```

---

**Architecture Documentation Complete** ✅

This provides a comprehensive overview of the CMS system structure, data flow, and components.
