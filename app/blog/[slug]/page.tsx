'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/cms-utils';
import { Eye, Calendar, User, Tag, FolderOpen } from 'lucide-react';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  author: { name: string; email?: string };
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');

      // Get post by slug
      const response = await fetch(`/api/cms/posts?search=${params.slug}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const foundPost = data.data.find((p: any) => p.slug === params.slug);
        if (foundPost) {
          setPost(foundPost);
          fetchRelatedPosts(foundPost.category._id);
        } else {
          setError('Post not found');
        }
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/cms/posts?category=${categoryId}&status=published&limit=3`
      );
      const data = await response.json();

      if (data.success) {
        setRelatedPosts(data.data.filter((p: any) => p._id !== post?._id).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-96 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meta Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <FolderOpen size={16} />
              {post.category.name}
            </Link>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <User size={16} />
              {post.author.name}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {post.views} views
            </span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/blog/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition"
                >
                  <Tag size={14} />
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-white p-8 rounded-lg shadow-md whitespace-pre-wrap text-gray-800">
            {post.content}
          </div>
        </div>

        {/* Author */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
          <h3 className="font-semibold text-gray-900 mb-2">About the Author</h3>
          <p className="text-gray-600">{post.author.name}</p>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {relatedPost.coverImage ? (
                      <img
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(relatedPost.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← Back to Blog
        </Link>
      </article>
    </div>
  );
}
