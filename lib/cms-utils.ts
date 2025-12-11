/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 200); // Limit length
}

/**
 * Check if a slug is unique (for validation)
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const Post = (await import('@/models/Post')).default;
  const query: any = { slug };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existing = await Post.findOne(query);
  return !existing;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to a certain length
 */
export function truncateText(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Validate SEO fields
 */
export function validateSEO(seo: any) {
  const errors: Record<string, string> = {};
  
  if (seo.metaTitle && seo.metaTitle.length > 60) {
    errors.metaTitle = 'Meta title should be less than 60 characters';
  }
  
  if (seo.metaDescription && seo.metaDescription.length > 160) {
    errors.metaDescription = 'Meta description should be less than 160 characters';
  }
  
  return errors;
}
