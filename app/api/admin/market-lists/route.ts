import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import MarketList from '@/models/MarketList';
import { z } from 'zod';

const createMarketListSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  filters: z.record(z.any()).optional(),
  static_items: z.array(z.string()).optional(),
  computed: z.object({
    type: z.enum(['dynamic', 'static']),
    refresh_seconds: z.number().min(0),
  }),
  visibility: z.enum(['public', 'private']).optional(),
  meta: z.record(z.any()).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const marketLists = await MarketList.find({}).sort({ last_updated: -1 });

    return NextResponse.json(marketLists);
  } catch (error) {
    console.error('Error fetching market lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMarketListSchema.parse(body);

    await dbConnect();
    const marketList = new MarketList({
      ...validatedData,
      last_updated: new Date(),
    });

    await marketList.save();

    return NextResponse.json(marketList, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error creating market list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
