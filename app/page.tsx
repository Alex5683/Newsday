'use client';

import { useSession } from 'next-auth/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { MarketOverview } from '../components/MarketOverview';
import { TrendingStocks } from '../components/TrendingStocks';
import MarketTable from '../components/MarketTable';
import { PopularScreens } from '../components/popular-screens';
import { NewsSection } from '../components/news-section';
import HomeBodyLayout from '../components/HomeBodyLayout';
import SidebarWidgets from '../components/SidebarWidgets';
import EconomicCalendar from '../components/EconomicCalendar';
import MostUndervaluedStocks from '../components/MostUndervaluedStocks';
import TopBrokers from '../components/TopBrokers';
import NewsGridSection from '../components/NewsGridSection';
import LiveNewsSections from '../components/LiveNewsSections';

import HomeTopNewsGrid from '../components/HomeTopNewsGrid';

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
      {/* Top News Grid Section */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <HomeTopNewsGrid />
        </div>
      </div>
      <main className="flex-1 bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Main body layout with sidebar */}
          <HomeBodyLayout sidebar={<SidebarWidgets />}>
            {/* Top News/Featured Stories */}
            <div className="mb-8">
              <NewsSection />
            </div>
            {/* Multiple Live News Sections by Category */}
            <LiveNewsSections />
            {/* Markets Overview */}
            <div className="mb-8">
              <MarketOverview />
            </div>
            {/* Market Table */}
            <div className="mb-8">
              <MarketTable />
            </div>
            {/* Most Undervalued Stocks */}
            <div className="mb-8">
              <MostUndervaluedStocks />
            </div>
            {/* Top Brokers */}
            <div className="mb-8">
              <TopBrokers />
            </div>
            {/* Economic Calendar */}
            <div className="mb-8">
              <EconomicCalendar />
            </div>
            {/* Popular Screens */}
            <div className="mb-8">
              <PopularScreens />
            </div>
            {/* Personalized/Welcome Section */}
            <div className="mb-8">
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
                </div>
              )}
            </div>
          </HomeBodyLayout>
        </div>
      </main>
      <Footer />
    </div>
  );
}
