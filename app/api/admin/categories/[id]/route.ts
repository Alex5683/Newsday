import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, parent } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await dbConnect();

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({
      name: name.trim(),
      _id: { $ne: params.id }
    });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }

    category.name = name.trim();
    category.description = description?.trim();
    category.slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    category.parent = parent || undefined;

    await category.save();

    const updatedCategory = await Category.findById(params.id).populate('parent', 'name');

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parent: params.id });
    if (subcategories.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.'
      }, { status: 400 });
    }

    await Category.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
