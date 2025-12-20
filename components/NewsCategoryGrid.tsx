import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, truncateText } from '@/lib/cms-utils-client';

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
  readingTime?: number; // in minutes
}

const NewsCategoryGrid: React.FC = () => {
  const [newsPosts, setNewsPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/cms/posts?status=published&category=news&limit=6&sortBy=-createdAt');
        const data = await res.json();
        if (data.success) {
          setNewsPosts(data.data);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchNewsPosts();
  }, []);

  const featured = newsPosts[0];
  const gridPosts = newsPosts.slice(1, 5);

  return (
    <section className="w-full mb-8">
      <h2 className="text-2xl font-bold mb-6">News Category</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Featured Article */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {featured ? (
            <>
              <Link href={`/blog/${featured.category?.slug}/${featured.slug}`} className="block relative">
                {featured.coverImage ? (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600" />
                )}
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Category icon at top-right */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  {/* Placeholder for category icon - assuming crypto/bitcoin */}
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v6l7 5 7-5V7l-7-5z"/>
                  </svg>
                </div>
                {/* Author, date, reading time overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span>{featured.author?.name}</span>
                    <span>•</span>
                    <span>{formatDate(featured.createdAt)}</span>
                    {featured.readingTime && (
                      <>
                        <span>•</span>
                        <span>{featured.readingTime} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
              <div className="p-6">
                <Link href={`/blog/${featured.category?.slug}/${featured.slug}`}>
                  <h2 className="text-2xl font-bold mb-3 leading-tight hover:underline transition-all">
                    {featured.title}
                  </h2>
                </Link>
              </div>
            </>
          ) : loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No featured post</div>
          )}
        </div>

        {/* Right: Ranked List #2-#4 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center text-gray-400 py-8">Loading...</div>
          ) : gridPosts.length === 0 ? (
            <div className="flex items-center justify-center text-gray-400 py-8">No posts</div>
          ) : (
            <>
              {gridPosts.slice(0, 3).map((post, index) => (
                <div key={post._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 2}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/blog/${post.category?.slug}/${post.slug}`} className="block">
                      <h3 className="font-semibold mb-2 leading-tight hover:underline transition-all line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      {post.readingTime && (
                        <>
                          <span>•</span>
                          <span>{post.readingTime} min read</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <Link href={`/blog/${post.category?.slug}/${post.slug}`} className="block">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg" />
                      )}
                    </Link>
                  </div>
                </div>
              ))}
              {/* View More Link */}
              <div className="pt-4 flex justify-end">
                <Link
                  href="/blog/category/news"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  View More →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsCategoryGrid;
