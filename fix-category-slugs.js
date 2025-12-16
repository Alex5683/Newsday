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

// Define Category schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  showInHeader: { type: Boolean, default: false },
  isMainHeader: { type: Boolean, default: false },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

async function fixCategorySlugs() {
  await connectDB();

  try {
    // Find categories with null or undefined slugs
    const categoriesToFix = await Category.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    }).lean();

    console.log(`Found ${categoriesToFix.length} categories to fix`);

    for (const category of categoriesToFix) {
      const newSlug = generateSlug(category.name);

      // Check if slug already exists
      const existing = await Category.findOne({ slug: newSlug });
      if (existing && existing._id.toString() !== category._id.toString()) {
        console.log(`Slug '${newSlug}' already exists for category '${existing.name}', skipping '${category.name}'`);
        continue;
      }

      await Category.updateOne(
        { _id: category._id },
        { $set: { slug: newSlug } }
      );

      console.log(`Fixed category '${category.name}' with slug '${newSlug}'`);
    }

    console.log('Category slug fix completed');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCategorySlugs();
