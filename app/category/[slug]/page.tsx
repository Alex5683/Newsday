import { redirect } from 'next/navigation';

export default async function CategoryRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  // Server component: params is now a Promise in Next.js 15+
  const { slug } = await params;
  redirect(`/blog/category/${slug}`);
  return null;
}
