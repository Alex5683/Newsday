'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Settings, Bell, TrendingUp, Home, BarChart3, Users, LogOut } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="w-64 bg-black text-white flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Analytics
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <Users className="h-5 w-5 mr-3" />
                  Users
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </a>
              </li>
            </ul>
          </nav>
          <div className="px-4 py-6">
            <button className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md w-full">
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const isAdmin = session.user?.role === 'admin';

  if (isAdmin) {
    // Admin layout with sidebar
    return (
      <div className="min-h-screen flex bg-white">
          {/* Sidebar */}
          <div className="w-64 bg-black text-white flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Analytics
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <Users className="h-5 w-5 mr-3" />
                  Users
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md">
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </a>
              </li>
            </ul>
          </nav>
          <div className="px-4 py-6">
            <button className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md w-full">
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {session.user?.name}!</h1>
              <p className="text-lg text-gray-600">
                Your personal dashboard for market insights and account management.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Section */}
              <div className="lg:col-span-1">
                <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{session.user?.name}</h3>
                    <p className="text-gray-500 mb-4">{session.user?.email}</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      session.user?.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Bell className="h-4 w-4 mr-2" />
                        Notification Preferences
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Market Watchlist
                      </button>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Logged in from new device</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <span className="text-sm text-gray-600">Updated profile information</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <span className="text-sm text-gray-600">Changed password</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Summary */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Summary</h3>
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-900 font-semibold">Index</th>
                        <th className="text-left py-2 text-gray-900 font-semibold">Value</th>
                        <th className="text-left py-2 text-gray-900 font-semibold">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">S&P 500</td>
                        <td className="py-2 text-gray-900 font-bold">34,567.89</td>
                        <td className="py-2 text-green-600">+1.23%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">NASDAQ</td>
                        <td className="py-2 text-gray-900 font-bold">4,321.56</td>
                        <td className="py-2 text-red-600">-0.45%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">DOW</td>
                        <td className="py-2 text-gray-900 font-bold">18,765.43</td>
                        <td className="py-2 text-green-600">+0.78%</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-700">VIX</td>
                        <td className="py-2 text-gray-900 font-bold">45,678.90</td>
                        <td className="py-2 text-red-600">-0.12%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // User layout with sidebar navigation
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-6">
              <h2 className="text-2xl font-bold">Dashboard</h2>
            </div>
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                      activeSection === 'profile'
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-white hover:text-black'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('quick-actions')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                      activeSection === 'quick-actions'
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-white hover:text-black'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Quick Actions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('recent-activity')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                      activeSection === 'recent-activity'
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-white hover:text-black'
                    }`}
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    Recent Activity
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('alerts-feed')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                      activeSection === 'alerts-feed'
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-white hover:text-black'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5 mr-3" />
                    Alerts Feed
                  </button>
                </li>
              </ul>
            </nav>
            <div className="px-4 py-6">
              <button className="flex items-center px-4 py-2 text-gray-300 hover:bg-white hover:text-black rounded-md w-full">
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {session.user?.name}!</h1>
                <p className="text-lg text-muted">
                  Your personal dashboard for market insights and account management.
                </p>
              </div>

              {/* Conditional Content */}
              {activeSection === 'profile' && (
                <div className="financial-card p-6 max-w-md">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Profile</h2>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-foreground font-bold text-xl">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-medium text-foreground">{session.user?.name}</h3>
                    <p className="text-muted mb-4">{session.user?.email}</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      session.user?.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.user?.role}
                    </span>
                  </div>
                </div>
              )}

              {activeSection === 'quick-actions' && (
                <div className="financial-card p-6 max-w-md">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full btn-outline flex items-center justify-center gap-2">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </button>
                    <button className="w-full btn-outline flex items-center justify-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notification Preferences
                    </button>
                    <button className="w-full btn-outline flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Market Watchlist
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'recent-activity' && (
                <div className="financial-card p-6 max-w-md">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-positive rounded-full"></div>
                      <span className="text-sm text-muted">Logged in from new device</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span className="text-sm text-muted">Updated profile information</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span className="text-sm text-muted">Changed password</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'alerts-feed' && (
                <div className="financial-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Alerts Feed</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Breaking: Tech Stocks Surge Amid AI Optimism</h4>
                          <p className="text-sm text-muted mb-2">Major technology companies report strong quarterly earnings, driving market confidence in AI investments.</p>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>2 hours ago</span>
                            <button className="text-blue-600 hover:text-blue-800">Read More</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Federal Reserve Signals Potential Rate Cuts</h4>
                          <p className="text-sm text-muted mb-2">Economic indicators suggest the Fed may reduce interest rates in the coming months to support growth.</p>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>4 hours ago</span>
                            <button className="text-blue-600 hover:text-blue-800">Read More</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Oil Prices Reach 6-Month High</h4>
                          <p className="text-sm text-muted mb-2">Global supply concerns push crude oil prices to their highest level since March.</p>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>6 hours ago</span>
                            <button className="text-blue-600 hover:text-blue-800">Read More</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Cryptocurrency Market Shows Signs of Recovery</h4>
                          <p className="text-sm text-muted mb-2">Bitcoin and major altcoins gain momentum as institutional adoption increases.</p>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>8 hours ago</span>
                            <button className="text-blue-600 hover:text-blue-800">Read More</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Trade Tensions Escalate Between Major Economies</h4>
                          <p className="text-sm text-muted mb-2">New tariffs announced, potentially impacting global supply chains and market stability.</p>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>12 hours ago</span>
                            <button className="text-blue-600 hover:text-blue-800">Read More</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
