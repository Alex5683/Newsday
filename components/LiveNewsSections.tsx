"use client";
import React, { useEffect, useState } from "react";
import NewsGridSection from "./NewsGridSection";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Post {
  _id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  category?: { name: string; slug: string };
  author?: { name: string };
  createdAt: string;
}


// Configurable section definitions
const SECTION_CONFIG = [
  { slug: "latest", title: "Latest News", postCount: 3 },
  { slug: "business", title: "Business", postCount: 3 },
  { slug: "technology", title: "Technology", postCount: 3 },
  { slug: "markets", title: "Markets", postCount: 3 },
  // Example tag-based section
  { tag: "editors-pick", title: "Editor's Picks", postCount: 3 },
];


export default function LiveNewsSections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [postsBySection, setPostsBySection] = useState<Record<string, Post[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all categories
        const catRes = await fetch("/api/cms/categories");
        const catData = await catRes.json();
        if (!catData.success) throw new Error("Failed to fetch categories");
        setCategories(catData.data);

        const postsObj: Record<string, Post[]> = {};
        await Promise.all(
          SECTION_CONFIG.map(async (section) => {
            if (section.slug) {
              // Category-based section
              const cat = catData.data.find((c: Category) => c.slug === section.slug);
              if (!cat) return;
              const postRes = await fetch(`/api/cms/posts?category=${cat._id}&limit=${section.postCount}`);
              const postData = await postRes.json();
              postsObj[section.title] = postData.success ? postData.data : [];
            } else if (section.tag) {
              // Tag-based section
              const postRes = await fetch(`/api/cms/posts?tags=${section.tag}&limit=${section.postCount}`);
              const postData = await postRes.json();
              postsObj[section.title] = postData.success ? postData.data : [];
            }
          })
        );
        setPostsBySection(postsObj);
      } catch (e: any) {
        setError(e.message || "Failed to load news sections");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading news sections...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;

  return (
    <>
      {SECTION_CONFIG.map((section) => {
        const posts = postsBySection[section.title] || [];
        if (!posts.length) return null;
        return (
          <NewsGridSection
            key={section.title}
            title={section.title}
            articles={posts.map((post) => ({
              title: post.title,
              summary: post.excerpt,
              image: post.coverImage,
              source: post.author?.name || (post.category?.name ?? section.title),
              time: new Date(post.createdAt).toLocaleString(),
              // Add a view all link for each section
              viewAllHref: post.category?.slug ? `/blog/category/${post.category.slug}` : undefined,
              postHref: `/blog/${post.category?.slug || 'post'}/${post._id}`,
            }))}
            viewAllHref={posts[0]?.category?.slug ? `/blog/category/${posts[0].category.slug}` : undefined}
          />
        );
      })}
    </>
  );
}