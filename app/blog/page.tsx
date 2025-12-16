'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate, truncateText } from '@/lib/cms-utils-client';
import { Pagination } from '@/components/CMS/CmsComponents';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  author: { name: string };
  createdAt: string;
  views: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('status', 'published');

      if (search) params.append('search', search);

      const response = await fetch(`/api/cms/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Discover latest articles and stories from our blog
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No posts found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.category.slug}/${post.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {post.category.name}
                      </span>
                      {post.tags.length > 0 && (
                        <span className="text-xs text-gray-500">
                          +{post.tags.length} tags
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.author.name}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
