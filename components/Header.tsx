'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from './AuthModal';

interface Category {
  _id: string;
  name: string;
  slug: string;
  showInHeader?: boolean;
  isMainHeader?: boolean;
}

interface NavItem {
  _id: string;
  name: string;
  href: string;
  order: number;
  isActive: boolean;
}

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [headerCategories, setHeaderCategories] = useState<Category[]>([]);
  const [subHeaderCategories, setSubHeaderCategories] = useState<Category[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [showSubNav, setShowSubNav] = useState(true);
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch header categories and nav items
  useEffect(() => {
    async function fetchMainHeaderCategories() {
      try {
        const response = await fetch('/api/categories/header');
        if (response.ok) {
          const data = await response.json();
          setHeaderCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch main header categories:', error);
      }
    }

    async function fetchSubHeaderCategories() {
      try {
        const response = await fetch('/api/categories/subheader');
        if (response.ok) {
          const data = await response.json();
          setSubHeaderCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch sub header categories:', error);
      }
    }

    async function fetchNavItems() {
      try {
        const response = await fetch('/api/admin/nav');
        if (response.ok) {
          const data = await response.json();
          setNavItems(data.navItems);
        }
      } catch (error) {
        console.error('Failed to fetch nav items:', error);
      }
    }

    // Fetch immediately on mount
    fetchMainHeaderCategories();
    fetchSubHeaderCategories();
    fetchNavItems();

    // Set up interval to fetch every 10 seconds
    const interval = setInterval(() => {
      fetchMainHeaderCategories();
      fetchSubHeaderCategories();
      fetchNavItems();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* TOP HEADER */}
        <div className="bg-[#1c1c1c] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-white">
              NewsDay
            </Link>

            {/* Search */}
            <div className="hidden md:flex items-center bg-[#2a2a2a] px-3 py-2 rounded-md w-[360px]">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search the website..."
                className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 text-sm">
              <button className="bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded font-medium text-white">
                Upgrade
              </button>
              {session?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:text-yellow-400 text-white"
                  >
                    <span>{session.user.name}</span>
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <ChevronDown size={16} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-white/10 rounded-md shadow-lg z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-white hover:bg-[#3a3a3a]"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      {session.user.role === 'admin' ? (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#3a3a3a]"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#3a3a3a]"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="/subscription"
                        className="block px-4 py-2 text-sm text-white hover:bg-[#3a3a3a]"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Subscription
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a]"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hover:text-yellow-400 text-white"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hover:text-yellow-400 text-white"
                  >
                    Free Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MAIN NAV */}
        <div className="bg-[#151515] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
            <nav className="flex gap-6 text-sm whitespace-nowrap text-gray-300 items-center">
              <input
                type="checkbox"
                checked={showSubNav}
                onChange={(e) => setShowSubNav(e.target.checked)}
                className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
              />
              {headerCategories.map(category => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="hover:text-yellow-400"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* SUB NAV */}
        {showSubNav && (
          <div className="bg-[#101010] border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
              <nav className="flex gap-5 text-xs whitespace-nowrap text-gray-400">
                {subHeaderCategories.map(category => (
                  <Link
                    key={category._id}
                    href={`/blog/category/${category.slug}`}
                    className="hover:text-yellow-400"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
