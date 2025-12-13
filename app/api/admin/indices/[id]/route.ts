import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import Index from '@/models/Index';
import { z } from 'zod';

const updateIndexSchema = z.object({
  name: z.string().min(1).optional(),
  exchange: z.string().min(1).optional(),
  members: z.array(z.object({
    instrument: z.string().min(1),
    weight: z.number().min(0).max(100),
  })).min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const index = await Index.findById(params.id);

    if (!index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }

    return NextResponse.json(index);
  } catch (error) {
    console.error('Error fetching index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateIndexSchema.parse(body);

    await dbConnect();
    const index = await Index.findByIdAndUpdate(
      params.id,
      { ...validatedData, last_updated: new Date() },
      { new: true }
    );

    if (!index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }

    return NextResponse.json(index);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const index = await Index.findByIdAndDelete(params.id);

    if (!index) {
      return NextResponse.json({ error: 'Index not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Index deleted successfully' });
  } catch (error) {
    console.error('Error deleting index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
