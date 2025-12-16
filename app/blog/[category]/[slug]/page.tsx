"use client";

import React, { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import Link from "next/link";
import { formatDate } from '@/lib/cms-utils-client';
import { Eye, Calendar, User, Tag, FolderOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BlogPostPageProps {
  params: {
    category: string;
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
  category: { _id: string; name: string; slug: string };
  tags: { _id: string; name: string; slug: string }[];
  author: { _id?: string; name: string; email?: string };
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export default function BlogPostPage() {
  // Use useParams hook for client component routing
  const { category, slug } = useParams() as { category: string; slug: string };
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPost();
  }, [category, slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch post by category and slug
      const response = await fetch(`/api/cms/posts?category=${category}&slug=${slug}&status=published`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setPost(data.data[0]);
        fetchRelatedPosts(data.data[0].category._id);
      } else {
        setError("Post not found");
      }
    } catch (err) {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/cms/posts?category=${categoryId}&status=published&limit=3`);
      const data = await response.json();
      if (data.success) {
        setRelatedPosts(data.data.filter((p: any) => p._id !== post?._id).slice(0, 3));
      }
    } catch {}
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!post) return null;

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
          <span><User className="inline w-4 h-4 mr-1" />{post.author?.name}</span>
          <span><Calendar className="inline w-4 h-4 mr-1" />{formatDate(post.createdAt)}</span>
          <span><FolderOpen className="inline w-4 h-4 mr-1" />{post.category?.name}</span>
          <span><Eye className="inline w-4 h-4 mr-1" />{post.views} views</span>
        </div>
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full rounded mb-6" />
        )}
        <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h4 className="font-semibold mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag._id} href={`/blog/tag/${tag.slug}`} className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">#{tag.name}</Link>
              ))}
            </div>
          </div>
        )}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Related Posts</h3>
            <ul className="space-y-2">
              {relatedPosts.map((rp) => (
                <li key={rp._id}>
                  <Link href={`/blog/${category}/${rp.slug}`} className="text-blue-700 hover:underline font-medium">{rp.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
