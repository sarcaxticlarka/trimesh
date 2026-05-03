'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
}

const menuItems = [
  { href: '/dashboard', icon: '⬡', label: 'Dashboard', desc: 'Your uploads & saved' },
  { href: '/ai-studio', icon: '✦', label: 'AI Studio', desc: 'Generate images with Groq', highlight: true },
  { href: '/upload', icon: '↑', label: 'Upload Model', desc: 'Share a new asset' },
  { href: '/settings', icon: '◈', label: 'Settings', desc: 'Profile & preferences' },
];

export default function UserAvatar({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = user.username.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-300 ${open
          ? 'bg-violet-500 ring-2 ring-violet-400/50 ring-offset-2 ring-offset-[#030303]'
          : 'bg-violet-600 hover:bg-violet-500'
          }`}
      >
        {initials}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#030303]" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-72 bg-black/90 rounded-[24px] border border-white/10 shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Profile header */}
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="ml-auto shrink-0 text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1 glass rounded-lg"
              >
                Edit
              </Link>
            </div>
            {user.bio && (
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed line-clamp-2">{user.bio}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${item.highlight
                  ? 'hover:bg-violet-500/10'
                  : 'hover:bg-white/5'
                  }`}
              >
                <span className={`text-lg w-7 text-center ${item.highlight ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                  {item.icon}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${item.highlight ? 'text-violet-300' : 'text-zinc-300 group-hover:text-white'} transition-colors`}>
                    {item.label}
                    {item.highlight && (
                      <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        AI
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-600">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="p-2 pt-0 border-t border-white/5 mt-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-all group text-left"
            >
              <span className="text-lg w-7 text-center text-zinc-600 group-hover:text-red-400 transition-colors">→</span>
              <p className="text-sm font-semibold text-zinc-500 group-hover:text-red-400 transition-colors">Sign Out</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
