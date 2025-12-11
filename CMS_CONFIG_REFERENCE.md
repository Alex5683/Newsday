# CMS Configuration Reference

## Environment Variables

Add these to your `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsday

# NextAuth Configuration
AUTH_SECRET=your_random_secret_key_here
AUTH_GOOGLE_ID=your_google_oauth_id
AUTH_GOOGLE_SECRET=your_google_oauth_secret

# Optional: For future Cloudinary integration
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Database Connection

The CMS uses Mongoose for MongoDB connection management. Connection pooling is handled automatically with caching to prevent connection growth during development.

**Connection String Format:**
```
mongodb+srv://[username:password@]host[/[database][?options]]
```

**Example:**
```
mongodb+srv://admin:password123@cluster0.mongodb.net/newsday?retryWrites=true&w=majority
```

## Authentication Flow

### NextAuth Configuration
- **Strategy:** JWT (JSON Web Tokens)
- **Providers:** 
  - Google OAuth (for social login)
  - Credentials Provider (email/password)

### Admin Role Assignment
Users need `role: 'admin'` in database to access CMS:

```javascript
// In MongoDB
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Session Structure
```javascript
{
  user: {
    id: "user_id",
    name: "User Name",
    email: "user@example.com",
    role: "admin" | "user",
    image: "url_to_image"
  },
  expires: "timestamp"
}
```

## API Configuration

### Default Limits
- **Posts per page:** 10 (customizable via `limit` param)
- **Blog posts per page:** 12
- **Max search results:** Pagination enforced
- **Slug max length:** 200 characters

### Request Headers
```
Content-Type: application/json
Authorization: (Handled by NextAuth session)
```

### Response Format
All API responses follow this structure:

```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "pagination": { /* if applicable */ }
}

// Error response
{
  "success": false,
  "error": "Error message",
  "data": null
}
```

## Database Indexes

Indexes are automatically created for optimal query performance:

```javascript
// posts
db.posts.createIndex({ slug: 1 })
db.posts.createIndex({ status: 1 })
db.posts.createIndex({ category: 1 })
db.posts.createIndex({ tags: 1 })
db.posts.createIndex({ createdAt: -1 })

// categories
db.categories.createIndex({ slug: 1 })
db.categories.createIndex({ name: 1 })

// tags
db.tags.createIndex({ slug: 1 })
db.tags.createIndex({ name: 1 })
```

## Component Configuration

### PostForm Component
```typescript
// Usage
<PostForm 
  onSubmit={handleSubmit}
  initialData={post} // optional for editing
  isLoading={false}
/>
```

### Pagination Component
```typescript
<Pagination
  currentPage={1}
  totalPages={5}
  onPageChange={(page) => setPage(page)}
/>
```

## Styling Configuration

### Tailwind CSS Classes Used
- Text sizing: `text-sm`, `text-lg`, `text-3xl`, `text-4xl`
- Colors: `gray-*`, `blue-*`, `red-*`, `green-*`, `yellow-*`, `purple-*`, `pink-*`, `orange-*`
- Spacing: `p-*`, `m-*`, `gap-*`, `px-*`, `py-*`
- Grid: `grid-cols-*`, `md:grid-cols-*`, `lg:grid-cols-*`

### Color Scheme
```
Primary: Blue (#3B82F6)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Error: Red (#EF4444)
Background: Gray-50 (#F9FAFB)
Text: Gray-900 (#111827)
```

## Form Validation Rules

### Zod Schemas
```typescript
// Post validation
title: min 5 characters
slug: required, must be unique
content: min 10 characters
category: required (must exist)
tags: array of valid IDs
status: 'draft' | 'published'
seo.metaTitle: max 60 characters
seo.metaDescription: max 160 characters
```

## Performance Optimization

### Caching Strategies
- Database connections cached in development
- Static route generation for blog pages
- Image lazy loading on blog pages
- Pagination to limit data fetching

### Database Optimization
- Indexes on frequently filtered fields
- Lean queries for read-only operations
- Population only when needed
- Limit and skip for pagination

### Frontend Optimization
- Next.js Image component (when integrated)
- Code splitting per route
- CSS minification with Tailwind
- Responsive image sizing

## Security Considerations

### Authentication
- All admin routes protected by middleware
- NextAuth validates sessions
- Passwords hashed with bcryptjs
- JWT tokens with expiration

### API Security
- Admin role verification on all mutating endpoints
- Input validation with Zod
- MongoDB injection protection via Mongoose
- CORS handled by Next.js defaults

### Data Validation
```typescript
// Server-side validation
- Email format validation
- Slug uniqueness check
- SEO field length limits
- Category/Tag existence verification
```

## Deployment Configuration

### Vercel Deployment
```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Environment on Production
- Set `MONGODB_URI` to production database
- Generate new `AUTH_SECRET` for production
- Update Google OAuth credentials for production domain
- Enable HTTPS for all routes

### Database Backup
- Regular MongoDB backups recommended
- Point-in-time recovery enabled
- Connection pooling optimized for load

## Monitoring & Logging

### Error Handling
```typescript
// Errors logged to console in development
console.error('Error message:', error);

// Production: Consider integrating with error tracking service
// Sentry, LogRocket, or similar
```

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor image loading times
- Track admin page load times

## Feature Flags & Toggles

### Future Enhancement Hooks
```typescript
// Enable comment system (future)
const COMMENTS_ENABLED = false;

// Enable post scheduling (future)
const SCHEDULING_ENABLED = false;

// Enable revision history (future)
const REVISION_HISTORY_ENABLED = false;
```

## API Rate Limiting

Currently not implemented but can be added:

```typescript
// Future: Add rate limiting middleware
// Recommended: 100 requests per minute for API endpoints
// 10 requests per minute for auth endpoints
```

## Middleware Configuration

### NextAuth Middleware
```typescript
// app/middleware.ts
export const config = {
  matcher: ['/admin/:path*']
};

// Only /admin/* routes are protected
// All other routes are public
```

## Troubleshooting Configuration Issues

### Connection Issues
- Verify MONGODB_URI syntax
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Authentication Issues
- Clear browser cookies
- Verify AUTH_SECRET set correctly
- Check Google OAuth credentials
- Verify redirect URIs

### API Issues
- Check Content-Type header
- Verify request body format
- Check for CORS errors
- Validate API endpoint paths

## Configuration Checklists

### Development Setup
- [ ] Node.js 18+ installed
- [ ] npm dependencies installed
- [ ] .env.local created
- [ ] MongoDB connection verified
- [ ] NextAuth configured
- [ ] Admin user created

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database backups configured
- [ ] SSL/TLS enabled
- [ ] Monitoring configured
- [ ] Error tracking setup
- [ ] Performance benchmarks recorded

### Post-Deployment
- [ ] Monitor error logs
- [ ] Verify API endpoints
- [ ] Test admin panel
- [ ] Test blog public pages
- [ ] Check performance metrics
- [ ] Setup alerts for errors

---

**Configuration Guide Complete** ✅

For setup help, see CMS_QUICKSTART.md
For detailed info, see CMS_DOCUMENTATION.md
