'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from './AuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <nav className="flex gap-6 text-sm whitespace-nowrap text-gray-300">
              <Link href="#" className="hover:text-yellow-400">Markets</Link>
              <Link href="#" className="hover:text-yellow-400">Watchlist</Link>
              <Link href="#" className="hover:text-yellow-400">News</Link>
              <Link href="#" className="hover:text-yellow-400">Analysis</Link>
              <Link href="#" className="hover:text-yellow-400">Charts</Link>
              <Link href="#" className="hover:text-yellow-400">Technical</Link>
              <Link href="#" className="hover:text-yellow-400">Tools</Link>
              <Link href="#" className="hover:text-yellow-400">Academy</Link>
              <Link href="#" className="hover:text-yellow-400">Economic Calendar</Link>
            </nav>
          </div>
        </div>

        {/* SUB NAV */}
        <div className="bg-[#101010] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
            <nav className="flex gap-5 text-xs whitespace-nowrap text-gray-400">
              <Link href="#" className="hover:text-yellow-400">United States</Link>
              <Link href="#" className="hover:text-yellow-400">Major Indices</Link>
              <Link href="#" className="hover:text-yellow-400">Index Futures</Link>
              <Link href="#" className="hover:text-yellow-400">Commodities</Link>
              <Link href="#" className="hover:text-yellow-400">Pre-Market</Link>
              <Link href="#" className="hover:text-yellow-400">After Hours</Link>
              <Link href="#" className="hover:text-yellow-400">Bitcoin</Link>
              <Link href="#" className="hover:text-yellow-400">Earnings Calendar</Link>
              <Link href="#" className="hover:text-yellow-400">Stocks Picked by AI</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
