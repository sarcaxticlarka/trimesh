'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useUser } from '../lib/hooks/useUser';
import UserAvatar from './UserAvatar';

export default function Navbar() {
  const { user, loading, logout } = useUser();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
    });
  }, []);

  return (
    <nav ref={navRef} className="fixed top-0 z-[100] w-full border-b border-white/[0.05] backdrop-blur-2xl bg-[#030303]/80">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-24">
        <Link href="/" className="flex items-center gap-4 font-bold text-3xl tracking-tighter text-white group">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-violet-600/20">
            <span className="text-xl">⬡</span>
          </div>
          TriMesh
        </Link>

        <div className="flex items-center gap-12">
          <div className="hidden md:flex items-center gap-10">
            <Link href="/browse" className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]">
              Library
            </Link>
            <Link href="/categories" className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]">
              Collections
            </Link>
            {user && (
              <Link href="/ai-studio" className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors text-xs font-bold uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                AI Studio
              </Link>
            )}
          </div>

          {!loading && (
            <div className="flex items-center gap-10">
              {user ? (
                <UserAvatar user={user} onLogout={logout} />
              ) : (
                <div className="flex items-center gap-10">
                  <Link href="/login" className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]">
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-black px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-white/5 active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
