# CMS System Documentation

## Overview

This is a complete Content Management System (CMS) built for the Next.js News application. It provides full post management capabilities, admin-only access control, and a beautiful public-facing blog interface.

## Features

### Admin Dashboard
- **CMS Dashboard** (`/admin/cms`) - Central hub with statistics and quick actions
- **Post Management** - Create, read, update, and delete posts
- **Category Management** - Organize posts by categories
- **Tag Management** - Organize posts by tags
- **Search & Filters** - Find posts by title, status, category, or tags
- **Pagination** - Browse through large post collections

### Post Features
- ✅ Auto-generated URL slugs from titles
- ✅ Draft and Published status
- ✅ SEO fields (meta title, meta description, keywords)
- ✅ Cover image support
- ✅ Rich text content editor
- ✅ Category and tag assignment
- ✅ Author attribution
- ✅ View count tracking
- ✅ Publication timestamps

### Public Blog
- **Blog Listing** (`/blog`) - Browse all published posts with pagination and search
- **Single Post** (`/blog/[slug]`) - Read full article with related posts
- **Category Pages** (`/blog/category/[slug]`) - View posts by category
- **Tag Pages** (`/blog/tag/[slug]`) - View posts by tag
- **Responsive Design** - Mobile-friendly interface

### Security
- ✅ NextAuth.js authentication with admin role protection
- ✅ All admin routes protected (`/admin/cms/*`)
- ✅ API routes validate admin status
- ✅ Middleware enforces authorization

## Database Models

### Post
```typescript
{
  title: string (required)
  slug: string (unique, required)
  content: string (required)
  excerpt: string (optional)
  coverImage: string (optional)
  category: ObjectId (ref: Category, required)
  tags: [ObjectId] (ref: Tag)
  author: ObjectId (ref: User, required)
  status: 'draft' | 'published' (default: 'draft')
  views: number (default: 0)
  seo: {
    metaTitle: string (max 60 chars)
    metaDescription: string (max 160 chars)
    keywords: [string]
  }
  timestamps: { createdAt, updatedAt, publishedAt }
}
```

### Category
```typescript
{
  name: string (unique, required)
  slug: string (unique, required)
  description: string (optional)
  parent: ObjectId (ref: Category, optional)
  showInHeader: boolean (default: false)
  isMainHeader: boolean (default: false)
  timestamps: { createdAt, updatedAt }
}
```

### Tag
```typescript
{
  name: string (unique, required)
  slug: string (unique, required)
  description: string (optional)
  color: string (default: '#3B82F6')
  timestamps: { createdAt, updatedAt }
}
```

## API Routes

### Posts

#### GET `/api/cms/posts`
List posts with pagination, search, and filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by title or excerpt
- `category` (string) - Filter by category ID
- `tags` (string, comma-separated) - Filter by tag IDs
- `status` (string) - Filter by 'draft' or 'published'
- `sortBy` (string, default: '-createdAt') - Sort field with optional - prefix for descending

**Response:**
```json
{
  "success": true,
  "data": [ /* Post objects */ ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### POST `/api/cms/posts` (Admin only)
Create a new post.

**Request Body:**
```json
{
  "title": "Post Title",
  "slug": "post-slug",
  "content": "Post content here...",
  "excerpt": "Short excerpt...",
  "coverImage": "https://example.com/image.jpg",
  "category": "category_id",
  "tags": ["tag_id_1", "tag_id_2"],
  "status": "published",
  "seo": {
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

#### GET `/api/cms/posts/[id]`
Get a single post by ID.

#### PUT `/api/cms/posts/[id]` (Admin only)
Update an existing post.

#### DELETE `/api/cms/posts/[id]` (Admin only)
Delete a post.

### Categories

#### GET `/api/cms/categories`
List all categories.

**Query Parameters:**
- `includeParent` (boolean) - Include parent category data

#### POST `/api/cms/categories` (Admin only)
Create a new category.

#### GET/PUT/DELETE `/api/cms/categories/[id]` (PUT and DELETE: Admin only)
Get, update, or delete a specific category.

### Tags

#### GET `/api/cms/tags`
List all tags.

#### POST `/api/cms/tags` (Admin only)
Create a new tag.

#### GET/PUT/DELETE `/api/cms/tags/[id]` (PUT and DELETE: Admin only)
Get, update, or delete a specific tag.

## Admin Pages

### `/admin/cms`
CMS Dashboard with statistics and quick actions.

### `/admin/cms/posts`
Manage all posts with search, filters, and bulk actions.

### `/admin/cms/posts/create`
Create a new blog post with full editor.

### `/admin/cms/posts/edit/[id]`
Edit an existing post.

### `/admin/cms/categories`
Manage categories with inline form.

### `/admin/cms/tags`
Manage tags with color picker and grid view.

## Public Pages

### `/blog`
List all published posts with pagination and search.

### `/blog/[slug]`
Display a single post with metadata, related posts, and author info.

### `/blog/category/[slug]`
Show all posts in a specific category.

### `/blog/tag/[slug]`
Show all posts with a specific tag.

## Components

### `PostForm` (`components/CMS/PostForm.tsx`)
Form component for creating and editing posts with:
- Title and slug generation
- Content editor
- Cover image URL input
- Category and tag selection
- Status selection
- SEO fields

### `CmsComponents.tsx` (`components/CMS/CmsComponents.tsx`)
Shared UI components:
- `Pagination` - Pagination controls
- `SortableHeader` - Sortable table headers
- `StatusBadge` - Status indicator badge
- `ConfirmDialog` - Confirmation dialog

## Utilities

### `cms-utils.ts` (`lib/cms-utils.ts`)
Helper functions:
- `generateSlug(text)` - Generate URL-friendly slugs
- `isSlugUnique(slug, excludeId)` - Check slug uniqueness
- `formatDate(date)` - Format dates for display
- `truncateText(text, length)` - Truncate text
- `validateSEO(seo)` - Validate SEO fields

## Setup Instructions

### 1. Install Dependencies
```bash
npm install react-hook-form @hookform/resolvers zod
```

### 2. Create MongoDB Collections
Collections are auto-created when models are used:
- `posts`
- `categories`
- `tags`

### 3. Environment Variables
Ensure your `.env.local` has:
```
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_nextauth_secret
AUTH_GOOGLE_ID=your_google_oauth_id
AUTH_GOOGLE_SECRET=your_google_oauth_secret
```

### 4. Create Admin User
Create a user with `role: 'admin'` in your database to access CMS.

### 5. Create Initial Categories and Tags
Use the admin interfaces to create categories and tags before creating posts.

## Usage Examples

### Create a Post via API
```bash
curl -X POST http://localhost:3000/api/cms/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "Post content...",
    "category": "category_id",
    "status": "published"
  }'
```

### Search Posts
```bash
# Search by title
/api/cms/posts?search=typescript

# Filter by status
/api/cms/posts?status=published

# Filter by category
/api/cms/posts?category=tech&status=published

# Search with pagination
/api/cms/posts?search=guide&page=2&limit=20
```

### Fetch Post by Slug
```javascript
// Get all posts (includes search and filtering)
const response = await fetch('/api/cms/posts?search=my-post-slug');
const posts = await response.json();
const post = posts.data.find(p => p.slug === 'my-post-slug');
```

## SEO Best Practices

1. **Meta Title** - Keep under 60 characters for best display
2. **Meta Description** - 150-160 characters optimal
3. **Keywords** - Add 3-5 relevant keywords per post
4. **Slug** - Use descriptive, hyphenated slugs
5. **Cover Image** - Use high-quality, relevant images

## Performance Tips

1. **Pagination** - Use pagination limits to avoid loading too many posts
2. **Search** - Use specific search terms for better results
3. **Indexes** - Database indexes are set up for slug, status, category, and tags
4. **Images** - Optimize cover images before uploading (compress and resize)
5. **Caching** - Consider adding caching for frequently accessed posts

## Troubleshooting

### Posts Not Showing
- Check if posts have `status: 'published'`
- Verify author exists in database
- Ensure category and tags are linked properly

### Slug Already Exists Error
- Slugs must be unique across all posts
- Auto-generated slugs append random chars if collision occurs
- Manually edit slug if needed

### Admin Route Access Denied
- Verify user has `role: 'admin'` in database
- Check NextAuth session is active
- Ensure middleware is protecting routes

### Images Not Loading
- Verify image URL is publicly accessible
- Check CORS settings if external domain
- Use relative paths for local images

## Future Enhancements

- [ ] Rich text editor (MDXEditor integration)
- [ ] Image upload to Cloudinary
- [ ] Comment system
- [ ] Author profiles
- [ ] Post scheduling
- [ ] Revision history
- [ ] Content analytics
- [ ] Email notifications

## Support

For issues or questions, refer to:
- Next.js Documentation: https://nextjs.org/docs
- NextAuth.js: https://next-auth.js.org
- MongoDB: https://docs.mongodb.com
