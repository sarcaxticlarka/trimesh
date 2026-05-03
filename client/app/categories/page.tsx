'use client';

import Link from 'next/link';
import { Lock, LayoutGrid, Box, Cpu, Play, Palette, Zap, Globe, Heart } from 'lucide-react';
import { useUser } from '../../lib/hooks/useUser';

const COLLECTIONS = [
  { icon: <LayoutGrid size={32} />, label: 'Gaming', count: '12.4k', color: 'text-blue-400' },
  { icon: <Box size={32} />, label: 'Architecture', count: '8.1k', color: 'text-emerald-400' },
  { icon: <Cpu size={32} />, label: 'VR / AR', count: '5.2k', color: 'text-violet-400' },
  { icon: <Play size={32} />, label: 'Animation', count: '3.9k', color: 'text-rose-400' },
  { icon: <Palette size={32} />, label: 'Characters', count: '15.2k', color: 'text-amber-400' },
  { icon: <Zap size={32} />, label: 'VFX', count: '2.1k', color: 'text-cyan-400' },
  { icon: <Globe size={32} />, label: 'Environment', count: '9.4k', color: 'text-indigo-400' },
  { icon: <Heart size={32} />, label: 'Favorites', count: 'Personal', color: 'text-pink-400' },
];

export default function CategoriesPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-[#030303] pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tighter">Premium Collections</h1>
            <p className="text-zinc-500 text-xl max-w-2xl">
              Welcome back, {user?.username || 'Creator'}. Explore our curated libraries of professional-grade 3D assets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLLECTIONS.map((c) => (
              <Link 
                key={c.label} 
                href={`/browse?category=${c.label}`}
                className="glass-card p-10 rounded-[40px] group hover:bg-white/[0.03] transition-all duration-500 border border-white/5"
              >
                <div className={`text-5xl mb-8 group-hover:scale-110 transition-transform ${c.color}`}>
                  {c.icon}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{c.label}</h3>
                    <p className="text-zinc-500 font-medium">{c.count} Assets</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <span className="text-white">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20 glass rounded-[48px] p-12 flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Can't find what you need?</h2>
              <p className="text-zinc-500">Request a custom collection or suggest a new category.</p>
            </div>
            <button className="bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-hero-gradient opacity-20"></div>
      
      <div className="max-w-xl w-full glass-card p-12 sm:p-20 rounded-[48px] text-center relative z-10 border border-white/10 shadow-2xl">
        <div className="w-24 h-24 bg-violet-600/20 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-violet-500/30">
          <Lock className="text-violet-400" size={40} />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tighter">Premium Collections</h1>
        <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
          Access to our curated collections and professional assets requires a TriMesh Studio account.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-zinc-200 transition-all active:scale-95"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="text-white font-bold px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all active:scale-95"
          >
            Create Account
          </Link>
        </div>
        
        <p className="mt-12 text-zinc-600 text-sm font-medium uppercase tracking-widest">
          Join 50k+ Creators worldwide
        </p>
      </div>
    </main>
  );
}
