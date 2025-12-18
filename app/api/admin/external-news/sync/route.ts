import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExternalNews from '@/models/ExternalNews';
import { newsAPI } from '@/lib/api/news';

/**
 * POST /api/admin/external-news/sync - Fetch and sync external news articles from API
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;

    // Fetch news from API
    const articles = await newsAPI.getFinancialNews(category, limit);

    let created = 0;
    let errors = 0;

    // Save each article to database
    for (const article of articles) {
      try {
        // Always create a new record so we keep every snapshot/article
        const newArticle = new ExternalNews({
          externalId: article.id,
          title: article.title,
          description: article.description,
          content: article.content,
          author: article.author,
          publishedAt: new Date(article.publishedAt),
          urlToImage: article.urlToImage,
          source: article.source,
          category: article.category,
          tags: article.tags,
          url: article.url,
          fetchedAt: new Date(),
          isActive: true,
        });
        await newArticle.save();
        created++;
      } catch (error) {
        console.error(`Error saving article ${article.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'External news articles synced',
      stats: {
        total: articles.length,
        created,
        updated: 0,
        errors,
      },
    });
  } catch (error: any) {
    console.error('Error syncing external news:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync external news' },
      { status: 500 }
    );
  }
}
