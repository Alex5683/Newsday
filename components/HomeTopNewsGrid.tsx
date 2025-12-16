
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
}

const latestHeadlines = [
  "US Threatens to Retaliate Against EU Fines Over Digital Tax",
  "OpenAI taps former UK finance minister Osborne to lead growth",
  "Tesla ramps up battery cell investments at German gigafactory",
  "What are the confirming loan limits for 2026?",
  "Uber Eats claims India $4M seed from Tata; WhatsApp chaos for LatAm drivers",
];


const HomeTopNewsGrid: React.FC = () => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingAndLatest = async () => {
      try {
        setLoading(true);
        // Fetch trending posts
        const trendingRes = await fetch('/api/cms/posts?status=published&trending=true&limit=5&sortBy=-createdAt');
        const trendingData = await trendingRes.json();
        if (trendingData.success) {
          setTrendingPosts(trendingData.data);
        }
        // Fetch latest posts
        const latestRes = await fetch('/api/cms/posts?status=published&limit=5&sortBy=-createdAt');
        const latestData = await latestRes.json();
        if (latestData.success) {
          setLatestPosts(latestData.data);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingAndLatest();
  }, []);

  const featured = trendingPosts[0];
  const moreTrending = trendingPosts.slice(1, 5);

  return (
    <section className="w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Featured Trending Post */}
        <div className="col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-[350px]">
          {featured ? (
            <>
              <Link href={`/blog/${featured.category?.slug}/${featured.slug}`} className="block">
                {featured.coverImage ? (
                  <img src={featured.coverImage} alt={featured.title} className="object-cover w-full h-56" />
                ) : (
                  <div className="w-full h-56 bg-linear-to-br from-blue-400 to-blue-600" />
                )}
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link href={`/blog/${featured.category?.slug}/${featured.slug}`} className="hover:underline">
                  <h2 className="text-xl font-bold mb-2 leading-tight line-clamp-2">{featured.title}</h2>
                </Link>
                <p className="text-gray-700 mb-2 line-clamp-3">{truncateText(featured.excerpt || '', 120)}</p>
                <span className="text-xs text-gray-500 mb-2">{featured.category?.name}</span>
                <span className="text-xs text-gray-400">{formatDate(featured.createdAt)}</span>
              </div>
            </>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">No trending post</div>
          )}
        </div>
        {/* Middle: More Trending Posts */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[350px]">
          <h3 className="text-lg font-semibold mb-4">Trending Posts</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
          ) : moreTrending.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">No trending posts</div>
          ) : (
            <ul className="space-y-3">
              {moreTrending.map((post) => (
                <li key={post._id}>
                  <Link href={`/blog/${post.category?.slug}/${post.slug}`} className="font-medium text-blue-700 hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-600 line-clamp-2">{truncateText(post.excerpt || '', 80)}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.category?.name}</span>
                    <span>·</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Right: Sidebar (Latest Posts) */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[350px]">
          <h3 className="text-lg font-semibold mb-4">Latest Posts</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
          ) : latestPosts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">No latest posts</div>
          ) : (
            <ul className="space-y-3">
              {latestPosts.map((post) => (
                <li key={post._id}>
                  <Link href={`/blog/${post.category?.slug}/${post.slug}`} className="font-medium text-blue-700 hover:underline">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.category?.name}</span>
                    <span>·</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeTopNewsGrid;
