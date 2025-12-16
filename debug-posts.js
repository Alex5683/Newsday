const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsday');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define schemas
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  showInHeader: { type: Boolean, default: false },
  isMainHeader: { type: Boolean, default: false },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
    slugOverride: { type: String },
  },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Post = mongoose.model('Post', PostSchema);

async function debugPosts() {
  await connectDB();

  try {
    // Get all posts with category populated
    const posts = await Post.find({}).populate('category', 'name slug').lean();

    console.log(`Total posts: ${posts.length}`);

    let postsWithUndefinedCategory = 0;
    let postsWithNullCategory = 0;
    let postsWithCategoryWithoutSlug = 0;
    let categoriesWithUndefinedSlug = 0;

    posts.forEach((post, index) => {
      if (!post.category) {
        console.log(`Post ${index}: ${post.title} - category is null/undefined`);
        postsWithNullCategory++;
      } else if (!post.category.slug) {
        console.log(`Post ${index}: ${post.title} - category slug is undefined: ${JSON.stringify(post.category)}`);
        postsWithCategoryWithoutSlug++;
      }
    });

    // Check categories
    const categories = await Category.find({}).lean();
    categories.forEach((cat, index) => {
      if (!cat.slug) {
        console.log(`Category ${index}: ${cat.name} - slug is undefined`);
        categoriesWithUndefinedSlug++;
      }
    });

    console.log('\nSummary:');
    console.log(`Posts with null/undefined category: ${postsWithNullCategory}`);
    console.log(`Posts with category but no slug: ${postsWithCategoryWithoutSlug}`);
    console.log(`Categories with undefined slug: ${categoriesWithUndefinedSlug}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugPosts();
