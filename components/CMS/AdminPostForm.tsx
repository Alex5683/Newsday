'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function AdminPostForm() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  // autosave state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // track last payload to avoid saving unchanged content
  const lastSavedRef = useRef<string>('');
  const autoSaveIntervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // build payload string
  const buildPayloadString = (payload: any) => JSON.stringify(payload);

  async function saveDraft(overrides?: { status?: 'draft' | 'published' }) {
    const toSave = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      status: overrides?.status ?? status,
      category: category.trim() || undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      excerpt: excerpt.trim() || undefined,
      content: content,
    };

    const payloadStr = buildPayloadString(toSave);

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
      const res = await fetch('/api/cms/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Save failed');
      }

      const data = await res.json();

      setIsSaving(false);
      setSaveStatus('saved');
      const ts = new Date().toLocaleTimeString();
      setLastSavedAt(ts);
      lastSavedRef.current = payloadStr;

      return { ok: true, data };
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        // aborted, ignore
        setIsSaving(false);
        setSaveStatus('idle');
        return { ok: false, aborted: true };
      }

      console.error('Auto-save error:', err);
      setIsSaving(false);
      setSaveStatus('error');
      return { ok: false, error: err };
    }
  }

  // Autosave every 15 seconds
  useEffect(() => {
    // start interval
    autoSaveIntervalRef.current = window.setInterval(() => {
      // do not auto-save while publishing
      if (isSaving) return;
      saveDraft({ status: 'draft' });
    }, 15000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const res = await saveDraft({ status: 'draft' });
    if (res.ok) {
      // feedback already set in saveDraft
    } else {
      alert('Save failed');
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Title is required to publish');
      return;
    }
    setStatus('published');
    const res = await saveDraft({ status: 'published' });
    if (res.ok) {
      alert('Published');
    } else {
      alert('Publish failed');
    }
  };

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Post Settings</h3>

              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm mb-3 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Example: News"
                className="block w-full border border-gray-200 rounded-md p-2 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma, separated, tags"
                className="block w-full border border-gray-200 rounded-md p-2 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagList.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Short summary (optional)"
                className="block w-full border border-gray-200 rounded-md p-2 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                placeholder="post-slug-here"
                className="block w-full border border-gray-200 rounded-md p-2 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSlug(generateSlug(title));
                    setSlugEdited(false);
                  }}
                  className="inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  Auto Slug
                </button>
                <button
                  onClick={handleSaveClick}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!title.trim()}
                  className={`inline-flex items-center justify-center px-3 py-2 text-sm rounded-md ${
                    title.trim() ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Publish
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {saveStatus === 'saving' && <span className="text-indigo-600">Saving...</span>}
                {saveStatus === 'saved' && lastSavedAt && (
                  <span className="text-green-600">Saved at {lastSavedAt}</span>
                )}
                {saveStatus === 'error' && <span className="text-red-600">Save failed</span>}
                {saveStatus === 'idle' && <span>Idle</span>}
              </div>
            </div>
          </aside>

          <main className="md:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col" style={{ minHeight: '60vh' }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a compelling title..."
                className="text-2xl md:text-3xl font-semibold outline-none border-none mb-4 placeholder-gray-400"
              />

              <div className="flex-1 flex flex-col">
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your post... (Markdown supported)"
                  className="flex-1 w-full h-[60vh] md:h-[60vh] resize-none border border-gray-200 rounded-md p-4 text-sm leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInsertH2}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      Insert H2
                    </button>
                    <button
                      onClick={handleClearContent}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{content.length}</span> characters
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
