'use client';

import { useSession } from 'next-auth/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to NewsDay
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Your trusted source for the latest news and updates
              </p>

            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {session ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back, {session.user?.name}!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                You're logged in as a {session.user?.role}
              </p>
              {session.user?.role === 'admin' && (
                <a
                  href="/admin"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Admin Dashboard
                </a>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stay Informed with NewsDay
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get the latest news, updates, and insights delivered to you.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Latest News</h3>
                  <p className="text-gray-600">Stay updated with breaking news and current events from around the world.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Analysis</h3>
                  <p className="text-gray-600">Get in-depth analysis and insights from our team of experienced journalists.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Feed</h3>
                  <p className="text-gray-600">Customize your news feed to focus on topics that matter most to you.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
