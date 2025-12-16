import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import User from '@/models/User';
import { generateSlug, validateSEO } from '@/lib/cms-utils-client';

/**
 * GET /api/cms/posts - List posts with search, filters, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || '-createdAt';
    const postSlug = searchParams.get('slug') || '';

    const query: any = {};

    // Search by title
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by post slug
    if (postSlug) {
      query.slug = postSlug;
    }

    // Filter by category slug (resolve to _id)
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category not found, return empty result
        return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, limit, pages: 0 } });
      }
    }

    // Filter by tags
    if (tags.length > 0 && tags[0] !== '') {
      query.tags = { $in: tags };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/posts - Create a new post (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      coverImage,
      category,
      tags = [],
      status = 'draft',
      seo = {},
    } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate SEO
    const seoErrors = validateSEO(seo);
    if (Object.keys(seoErrors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'SEO validation failed', details: seoErrors },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = providedSlug || generateSlug(title);

    // Check if slug is unique
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Verify tags exist
    if (tags.length > 0) {
      const existingTags = await Tag.countDocuments({ _id: { $in: tags } });
      if (existingTags !== tags.length) {
        return NextResponse.json(
          { success: false, error: 'One or more tags not found' },
          { status: 404 }
        );
      }
    }

    // Get or create admin user for author field
    let author = await User.findOne({ role: 'admin' });
    if (!author) {
      // Create default admin user if none exists
      author = await User.create({
        name: 'Admin',
        email: 'admin@newsday.local',
        role: 'admin',
      });
    }

    // Create post
    const post = new Post({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      coverImage,
      category,
      tags,
      author: author._id,
      status,
      seo,
      publishedAt: status === 'published' ? new Date() : null,
    });

    await post.save();
    await post.populate('category', 'name slug');
    await post.populate('tags', 'name slug');
    await post.populate('author', 'name email');

    return NextResponse.json(
      { success: true, data: post },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating post:', error);
    const errorMessage = error?.message || 'Failed to create post';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
