# Setting Up the CMS for Development

## 1. Environment Setup

Create a `.env.local` file in the project root with your MongoDB connection string:

```bash
MONGODB_URI=mongodb://localhost:27017/newsday
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

## 2. Start the Development Server

```bash
npm run dev
```

The application should be available at `http://localhost:3000`

## 3. Initialize Sample Data

The CMS requires categories and tags to create posts. Use the setup endpoint to initialize sample data:

### Option A: Using a browser or curl

Visit: `http://localhost:3000/api/debug/setup` with a POST request

Using curl:
```bash
curl -X POST http://localhost:3000/api/debug/setup
```

This will create:
- Sample categories: News, Technology, Business, Lifestyle
- Sample tags: Breaking News, Featured, Analysis, Interview, Opinion
- Admin user (if doesn't exist)

### Option B: Manual Database Setup

If you prefer to create data manually, connect to MongoDB and insert documents:

```javascript
// Connect to MongoDB
use newsday

// Create categories
db.categories.insertMany([
  { name: "News", slug: "news", description: "Latest news and updates", createdAt: new Date(), updatedAt: new Date() },
  { name: "Technology", slug: "technology", description: "Tech news and reviews", createdAt: new Date(), updatedAt: new Date() },
  { name: "Business", slug: "business", description: "Business and finance", createdAt: new Date(), updatedAt: new Date() },
  { name: "Lifestyle", slug: "lifestyle", description: "Lifestyle and wellness", createdAt: new Date(), updatedAt: new Date() },
])

// Create tags
db.tags.insertMany([
  { name: "Breaking News", slug: "breaking-news", createdAt: new Date(), updatedAt: new Date() },
  { name: "Featured", slug: "featured", createdAt: new Date(), updatedAt: new Date() },
  { name: "Analysis", slug: "analysis", createdAt: new Date(), updatedAt: new Date() },
  { name: "Interview", slug: "interview", createdAt: new Date(), updatedAt: new Date() },
  { name: "Opinion", slug: "opinion", createdAt: new Date(), updatedAt: new Date() },
])
```

## 4. Check System Status

Visit `http://localhost:3000/api/debug/check` to verify:
- Database connectivity
- User authentication status
- Available categories and tags
- Record counts

## 5. Admin Dashboard

1. Go to `http://localhost:3000/admin`
2. Log in with your credentials
3. Navigate to the Blog section
4. Start creating posts!

## Troubleshooting

### "Failed to create post" error

This usually means:
1. **No categories exist** - Run the setup endpoint or create manually
2. **Not authenticated** - Make sure you're logged in as an admin user
3. **Database connection issue** - Check MongoDB is running and MONGODB_URI is correct
4. **Validation error** - Ensure title, content, and category are all filled in

Check the browser console for the detailed error message.

### MongoDB Connection Errors

Make sure MongoDB is running:
```bash
# Using MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

---

**Note:** The `/api/debug` endpoints are for development only. Delete or protect them in production!
