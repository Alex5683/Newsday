# CMS Quick Start Guide

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Update Environment Variables
Add to your `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_nextauth_secret
```

## First Time Setup

### Step 1: Create Admin User
In MongoDB, add a user with admin role:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "hashed_password_here",
  role: "admin",
  image: null
})
```

Or use the signup flow and manually update the role in database:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Step 2: Create Categories
1. Go to `/admin/cms/categories`
2. Click "Add Category"
3. Fill in the form:
   - **Name:** e.g., "Technology", "News", "Business"
   - **Slug:** e.g., "technology", "news", "business"
   - **Description:** Optional category description
4. Click "Add"

**Recommended Categories:**
- Technology
- Business
- Lifestyle
- Entertainment
- Sports
- Health

### Step 3: Create Tags
1. Go to `/admin/cms/tags`
2. Click "Add Tag"
3. Fill in the form:
   - **Name:** e.g., "React", "Python", "Next.js"
   - **Slug:** e.g., "react", "python", "nextjs"
   - **Description:** Optional tag description
   - **Color:** Pick a color for visual identification
4. Click "Add"

**Recommended Tags:**
- Featured
- Breaking News
- Tutorial
- Interview
- Review
- Analysis

### Step 4: Create Your First Post
1. Go to `/admin/cms/posts/create`
2. Fill in the form:
   - **Title:** Post title (auto-generates slug)
   - **Content:** Write your post content
   - **Excerpt:** Short summary (auto-generated from content)
   - **Cover Image:** URL to cover image
   - **Category:** Select from dropdown
   - **Tags:** Check relevant tags
   - **Status:** Choose "Draft" or "Published"
   - **SEO:** Fill in meta title and description
3. Click "Create Post"

## Navigation

### Admin Panel
- **Dashboard:** `/admin/cms` - Overview and quick actions
- **Posts:** `/admin/cms/posts` - Manage all posts
- **Create Post:** `/admin/cms/posts/create` - New post form
- **Edit Post:** `/admin/cms/posts/edit/[id]` - Edit existing post
- **Categories:** `/admin/cms/categories` - Manage categories
- **Tags:** `/admin/cms/tags` - Manage tags

### Public Blog
- **Blog Home:** `/blog` - All published posts
- **Post:** `/blog/[slug]` - Individual post page
- **Category:** `/blog/category/[slug]` - Posts by category
- **Tag:** `/blog/tag/[slug]` - Posts by tag

## Common Tasks

### How to Publish a Draft Post
1. Go to `/admin/cms/posts`
2. Click Edit on the post
3. Change Status to "Published"
4. Click "Update Post"

### How to Search Posts
1. Go to `/admin/cms/posts`
2. Use the search box at the top
3. Type post title or keywords
4. Results update in real-time

### How to Filter Posts
1. Go to `/admin/cms/posts`
2. Use the Status dropdown: "All Status", "Draft", "Published"
3. Posts are filtered automatically

### How to Delete a Post
1. Go to `/admin/cms/posts`
2. Click the delete (trash) icon
3. Confirm deletion
4. Post is removed permanently

### How to Add Tags to Post
1. Go to `/admin/cms/posts/create` or edit an existing post
2. Scroll to "Tags" section
3. Check boxes for tags you want to add
4. Multiple tags can be selected
5. Save the post

## Features Explained

### Auto-Generated Slug
- Slugs are automatically generated from the title
- They're URL-friendly (lowercase, hyphens, no special chars)
- You can manually edit the slug if needed
- Slugs must be unique

### Status Options
- **Draft:** Not visible on public blog, only in admin
- **Published:** Visible on public blog with auto-set publication date

### View Count
- Automatically incremented when someone views a published post
- Shows in admin posts list and on post page

### SEO Fields
- **Meta Title:** Appears in browser tab and search results (50-60 chars recommended)
- **Meta Description:** Appears under title in search results (150-160 chars recommended)
- **Keywords:** Comma-separated list of relevant terms

### Cover Images
- Enter a URL to an image
- Supports any external image URL
- Displayed on blog listing and post pages
- Recommended size: 1200x630px

## API Usage Examples

### Get All Published Posts
```javascript
const response = await fetch('/api/cms/posts?status=published&limit=10');
const { data, pagination } = await response.json();
console.log(data); // Array of posts
console.log(pagination); // { total, page, limit, pages }
```

### Get Posts by Category
```javascript
const response = await fetch('/api/cms/posts?category=category_id&status=published');
const { data } = await response.json();
```

### Search Posts
```javascript
const response = await fetch('/api/cms/posts?search=typescript&status=published');
const { data } = await response.json();
```

### Get Single Post
```javascript
const response = await fetch('/api/cms/posts/post_id');
const { data: post } = await response.json();
```

## Security Notes

- ✅ All admin routes are protected by NextAuth
- ✅ Only users with role 'admin' can access CMS
- ✅ All API endpoints validate admin role
- ✅ Passwords are hashed with bcrypt
- ✅ Sessions are JWT-based

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in
- Make sure your user has `role: 'admin'`
- Check browser console for session issues

### Post Won't Save
- Check all required fields are filled (Title, Content, Category, Status)
- Check SEO fields don't exceed character limits
- Check slug is unique (not used by another post)

### Image Not Showing
- Verify image URL is correct and publicly accessible
- Try a different image URL
- Check console for CORS errors

### Can't Find Category/Tags
- Make sure you created them before creating posts
- Refresh the page to reload the list
- Check if they were actually saved

## Tips & Tricks

1. **Batch Import:** Use the API to programmatically create multiple posts
2. **Scheduling:** Save posts as "Draft" and publish them later
3. **Author Info:** Appears from your user profile in the system
4. **Pagination:** Posts page shows 10 items per page, navigate with pagination controls
5. **Mobile Friendly:** Admin panel is fully responsive, edit posts on mobile

## Next Steps

1. Customize the blog styling in `globals.css`
2. Add more categories and tags
3. Create several test posts
4. Share your blog URL
5. Consider adding comments or newsletter signup

## Support

For detailed documentation, see: `CMS_DOCUMENTATION.md`
