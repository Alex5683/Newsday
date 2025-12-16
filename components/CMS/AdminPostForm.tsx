'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CategoryOption {
  _id: string;
  name: string;
}

interface TagOption {
  _id: string;
  name: string;
}

interface AdminPostFormProps {
  initialPost?: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category: { _id: string; name: string };
    tags: { _id: string; name: string }[];
    status: 'draft' | 'published';
  };
  postId?: string;
}

export default function AdminPostForm({ initialPost, postId }: AdminPostFormProps) {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [slugEdited, setSlugEdited] = useState(!!initialPost);
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status || 'draft');
  const [category, setCategory] = useState(initialPost?.category?._id || ''); // store MongoDB _id
  const [tags, setTags] = useState<string[]>(initialPost?.tags?.map((t) => t._id) || []); // store MongoDB _ids
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [trending, setTrending] = useState(initialPost?.trending || false);

  // data fetching
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [allTags, setAllTags] = useState<TagOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  // autosave state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // track last payload to avoid saving unchanged content
  const lastSavedRef = useRef<string>('');
  const autoSaveIntervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/cms/categories');
        const data = await res.json();
        if (data.data) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/cms/tags');
        const data = await res.json();
        if (data.data) {
          setAllTags(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  }

  useEffect(() => {
    if (!slugEdited) setSlug(generateSlug(title));
  }, [title, slugEdited]);

  // Auto-expand textarea as content grows
  useEffect(() => {
    const textarea = contentRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [content]);

  async function saveDraft(overrides?: { status?: 'draft' | 'published' }) {
    // Validate required fields
    if (!title.trim()) {
      console.warn('Cannot save: title is required');
      return { ok: false, error: 'Title is required' };
    }

    if (!content.trim()) {
      console.warn('Cannot save: content is required');
      return { ok: false, error: 'Content is required' };
    }

    if (!category.trim()) {
      console.warn('Cannot save: category is required');
      return { ok: false, error: 'Category is required' };
    }

    const toSave = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      status: overrides?.status ?? status,
      category: category.trim(), // MongoDB ObjectId string
      tags: tags.filter(Boolean), // Array of MongoDB ObjectIds
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      trending,
    };

    const payloadStr = JSON.stringify(toSave);

    // Skip if nothing changed
    if (payloadStr === lastSavedRef.current) {
      return { ok: true, skipped: true };
    }

    // abort previous
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const endpoint = postId ? `/api/cms/posts/${postId}` : '/api/cms/posts';
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setIsSaving(false);
      setSaveStatus('saved');
      setSaveError(null);
      const ts = new Date().toLocaleTimeString();
      setLastSavedAt(ts);
      lastSavedRef.current = payloadStr;

      return { ok: true, data };
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        setIsSaving(false);
        setSaveStatus('idle');
        setSaveError(null);
        return { ok: false, aborted: true };
      }

      const errorMsg = (err as any)?.message || 'Unknown error';
      console.error('Auto-save error:', err);
      setIsSaving(false);
      setSaveStatus('error');
      setSaveError(errorMsg);
      return { ok: false, error: errorMsg };
    }
  }

  // Autosave every 15 seconds (only if form is valid)
  useEffect(() => {
    // Auto-save disabled - users must manually save
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, category]);

  const handleInsertH2 = () => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const insert = '## ';
    const newContent = content.slice(0, start) + insert + content.slice(start);
    setContent(newContent);
    requestAnimationFrame(() => {
      const pos = start + insert.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const handleClearContent = () => {
    setContent('');
    const ta = contentRef.current;
    if (ta) ta.focus();
  };

  const handleSaveClick = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (!content.trim()) {
      alert('Content is required');
      return;
    }
    if (!category.trim()) {
      alert('Category is required');
      return;
    }
    const res = await saveDraft({ status: 'draft' });
    if (!res.ok && !res.aborted) {
      alert(`Save failed: ${res.error}`);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Title is required to publish');
      return;
    }
    if (!content.trim()) {
      alert('Content is required to publish');
      return;
    }
    if (!category.trim()) {
      alert('Category is required to publish');
      return;
    }
    const res = await saveDraft({ status: 'published' });
    if (res.ok) {
      alert('Published successfully');
    } else if (!res.aborted) {
      alert(`Publish failed: ${res.error}`);
    }
  };

  const toggleTag = (tagId: string) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const selectedCategoryName = categories.find((c) => c._id === category)?.name || '';
  const selectedTagNames = allTags
    .filter((t) => tags.includes(t._id))
    .map((t) => t.name);

  const isFormValid = title.trim() && content.trim() && category.trim();

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Post Settings
              </h3>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✓ Published</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              {categoriesLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Loading categories...</div>
              ) : (
                <>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {category && (
                    <div className="mt-2 inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                      Selected: {selectedCategoryName}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Tags</label>
              {tagsLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Loading tags...</div>
              ) : allTags.length === 0 ? (
                <div className="text-sm text-gray-500">No tags available</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {allTags.map((tag) => (
                    <label key={tag._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={tags.includes(tag._id)}
                        onChange={() => toggleTag(tag._id)}
                        className="rounded border-gray-300 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {selectedTagNames.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTagNames.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-indigo-100 px-2.5 py-1 rounded-full text-indigo-700 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Trending */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={() => setTrending((v) => !v)}
                  className="rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Trending Post</span>
              </label>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Short summary (optional)"
                className="block w-full border border-gray-300 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{excerpt.length} / 160 characters</p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  placeholder="post-slug-here"
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  onClick={() => {
                    setSlug(generateSlug(title));
                    setSlugEdited(false);
                  }}
                  className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300"
                  title="Generate slug from title"
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveClick}
                disabled={!isFormValid}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition ${
                  isFormValid
                    ? 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    : 'border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={!isFormValid}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition ${
                  isFormValid
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m2-1l-2-1m2 1v2.5" />
                </svg>
                Publish Post
              </button>
            </div>

            {/* Save Status */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                  Saving...
                </div>
              )}
              {saveStatus === 'saved' && lastSavedAt && (
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved at {lastSavedAt}
                </div>
              )}
              {saveStatus === 'error' && saveError && (
                <div className="text-red-600 font-medium text-xs flex gap-2">
                  <svg className="h-4 w-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{saveError}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
            {/* Title */}
            <div className="mb-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a compelling title..."
                className="text-4xl md:text-5xl font-bold outline-none border-none mb-2 placeholder-gray-400 bg-white w-full"
              />
              <div className="h-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full w-20"></div>
            </div>

            {/* Content Editor */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-gray-500 font-medium">📝 Markdown supported</p>
              </div>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your post... (Markdown supported)"
                className="w-full min-h-96 resize-none border border-gray-200 rounded-lg p-6 text-base leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                style={{ height: 'auto', overflowY: 'visible' }}
              />

              {/* Content Toolbar */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleInsertH2}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-white hover:border-indigo-500 transition"
                    title="Insert H2 heading"
                  >
                    <span className="text-lg">H2</span>
                  </button>
                  <button
                    onClick={handleClearContent}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-white hover:border-red-500 transition"
                    title="Clear all content"
                  >
                    🗑️ Clear
                  </button>
                </div>

                <div className="text-sm font-medium text-gray-600">
                  <span className="text-indigo-600 font-semibold">{content.length}</span> characters
                  {content.length > 0 && (
                    <span className="text-gray-400 ml-2">
                      · {Math.ceil(content.length / 5)} words (approx)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
