'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSlug } from '@/lib/cms-utils-client';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  coverImage: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<void>;
  initialData?: PostFormData;
  isLoading?: boolean;
}

export function PostForm({ onSubmit, initialData, isLoading = false }: PostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || {
      status: 'draft',
      tags: [],
    },
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const titleValue = watch('title');

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (titleValue && !initialData) {
      setValue('slug', generateSlug(titleValue));
    }
  }, [titleValue, setValue, initialData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/cms/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/cms/tags');
      const data = await response.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
    setValue('tags', selectedTags.includes(tagId) 
      ? selectedTags.filter((id) => id !== tagId) 
      : [...selectedTags, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit((data) => {
      data.tags = selectedTags;
      onSubmit(data);
    })} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
        <input
          {...register('title')}
          type="text"
          placeholder="Enter post title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Slug</label>
        <input
          {...register('slug')}
          type="text"
          placeholder="auto-generated-slug"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Excerpt</label>
        <textarea
          {...register('excerpt')}
          placeholder="Short description of the post"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
        <textarea
          {...register('content')}
          placeholder="Post content"
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Cover Image URL</label>
        <input
          {...register('coverImage')}
          type="text"
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
        <select
          {...register('category')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Tags</label>
        <div className="space-y-2">
          {tags.map((tag) => (
            <label key={tag._id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag._id)}
                onChange={() => handleTagChange(tag._id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
        <select
          {...register('status')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* SEO Fields */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Meta Title</label>
            <input
              {...register('seo.metaTitle')}
              type="text"
              placeholder="SEO title (max 60 characters)"
              maxLength={60}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Meta Description</label>
            <textarea
              {...register('seo.metaDescription')}
              placeholder="SEO description (max 160 characters)"
              maxLength={160}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}
