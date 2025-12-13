import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import { getRedis, REDIS_KEYS } from '@/lib/redis';
import MarketList from '@/models/MarketList';
import { z } from 'zod';

const updateMarketListSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  filters: z.record(z.any()).optional(),
  static_items: z.array(z.string()).optional(),
  computed: z.object({
    type: z.enum(['dynamic', 'static']),
    refresh_seconds: z.number().min(0),
  }).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  meta: z.record(z.any()).optional(),
});

async function computeTopMovers(): Promise<string[]> {
  await dbConnect();
  const db = (global as any).mongoose.connection.db;

  // Get last 24h data
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Aggregate to get latest close and previous close for each symbol
  const pipeline = [
    {
      $match: {
        timestamp: { $gte: twentyFourHoursAgo }
      }
    },
    {
      $sort: { 'metadata.symbol': 1, timestamp: -1 }
    },
    {
      $group: {
        _id: '$metadata.symbol',
        latest: { $first: '$close' },
        previous: { $last: '$close' }
      }
    },
    {
      $match: {
        latest: { $exists: true },
        previous: { $exists: true }
      }
    },
    {
      $project: {
        symbol: '$_id',
        changePercent: {
          $multiply: [
            { $divide: [{ $subtract: ['$latest', '$previous'] }, '$previous'] },
            100
          ]
        }
      }
    },
    {
      $sort: { changePercent: -1 }
    },
    {
      $limit: 10
    }
  ];

  const results = await db.collection('price_bars_1m').aggregate(pipeline).toArray();
  return results.map((r: any) => r.symbol);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const marketList = await MarketList.findOne({ slug: params.slug });

    if (!marketList) {
      return NextResponse.json({ error: 'Market list not found' }, { status: 404 });
    }

    const redis = getRedis();
    const cacheKey = REDIS_KEYS.marketListItems(params.slug);

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Compute the list
    let items: string[] = [];

    if (marketList.computed.type === 'static') {
      items = marketList.static_items;
    } else {
      // For now, only top-movers is implemented
      if (params.slug === 'top-movers') {
        items = await computeTopMovers();
      }
      // Add static items at top if they exist
      if (marketList.static_items.length > 0) {
        items = [...marketList.static_items, ...items];
      }
    }

    const result = {
      slug: marketList.slug,
      title: marketList.title,
      items,
      computed_at: new Date().toISOString(),
    };

    // Cache with TTL
    await redis.setex(cacheKey, marketList.computed.refresh_seconds, JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching market list items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateMarketListSchema.parse(body);

    await dbConnect();
    const marketList = await MarketList.findOneAndUpdate(
      { slug: params.slug },
      { ...validatedData, last_updated: new Date() },
      { new: true }
    );

    if (!marketList) {
      return NextResponse.json({ error: 'Market list not found' }, { status: 404 });
    }

    return NextResponse.json(marketList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating market list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const marketList = await MarketList.findOneAndDelete({ slug: params.slug });

    if (!marketList) {
      return NextResponse.json({ error: 'Market list not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Market list deleted successfully' });
  } catch (error) {
    console.error('Error deleting market list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
