'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useModels } from '../lib/hooks/useModels';
import ModelCard from '../components/ModelCard';

import { LayoutGrid, Box, Cpu, Play, Search, Download, Sparkles, Palette } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const categories = [
  { icon: <LayoutGrid size={32} className="text-violet-400" />, label: 'Gaming', desc: 'Characters & assets' },
  { icon: <Box size={32} className="text-violet-400" />, label: 'Architecture', desc: 'Buildings & interiors' },
  { icon: <Cpu size={32} className="text-violet-400" />, label: 'VR / AR', desc: 'Optimized models' },
  { icon: <Play size={32} className="text-violet-400" />, label: 'Animation', desc: 'Rigged assets' },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { models: featuredModels, loading: modelsLoading } = useModels();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero Entry
      gsap.from('.hero-reveal', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power4.out',
      });

      gsap.from('.hero-img', {
        scale: 0.8,
        opacity: 0,
        duration: 2,
        ease: 'expo.out',
      });

      // Section Reveals
      gsap.utils.toArray('.reveal-group').forEach((section: any) => {
        gsap.from(section.querySelectorAll('.reveal-item'), {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        });
      });

      // Pinned Showcase
      ScrollTrigger.create({
        trigger: '.showcase-pin',
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: true,
        animation: gsap.to('.showcase-track', {
          x: '-50%',
          ease: 'none'
        })
      });

      // Floating Parallax
      gsap.to('.parallax-layer', {
        scrollTrigger: {
          trigger: '.parallax-container',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: (i, t) => -100 * parseFloat(t.dataset.speed || '1'),
        ease: 'none',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#030303] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-40"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-bold uppercase tracking-widest text-violet-400 mb-10 hero-reveal">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              The Future of 3D is here
            </div>
            <h1 className="text-7xl sm:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.85] mb-12 hero-reveal">
              <span className="block text-gradient">DESIGN</span>
              <span className="block">BEYOND</span>
              <span className="block text-gradient">REALITY.</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg mb-12 leading-relaxed hero-reveal">
              TriMesh is a curated marketplace for high-end 3D assets. Built for professionals who demand excellence in every vertex.
            </p>
            <div className="flex items-center gap-6 hero-reveal">
              <Link
                href="/browse"
                className="bg-white text-black font-bold px-12 py-5 rounded-full text-lg transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl shadow-white/10"
              >
                Start Browsing
              </Link>
              <Link
                href="/signup"
                className="text-white font-bold px-8 py-5 rounded-full text-lg border border-white/10 hover:bg-white/5 transition-all"
              >
                Join Now
              </Link>
            </div>
          </div>
          <div className="hero-img relative flex justify-center items-center">
            <div className="w-[500px] h-[500px] lg:w-[750px] lg:h-[750px] relative animate-float">
              <img src="/assets/hero.png" alt="3D Model" className="w-full h-full object-contain filter drop-shadow-[0_0_120px_rgba(139,92,246,0.4)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models Section */}
      <section className="py-32 px-6 reveal-group">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20 reveal-item">
            <div>
              <h2 className="text-5xl font-bold mb-6 text-gradient">Editor's Choice</h2>
              <p className="text-xl text-zinc-500 max-w-xl">A hand-picked selection of the most impressive models from our community.</p>
            </div>
            <Link href="/browse" className="text-white font-bold border-b border-white/20 pb-2 hover:border-white transition-all">
              Explore entire library →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal-item">
            {modelsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-[32px] h-96 animate-pulse bg-white/5" />
              ))
            ) : (
              featuredModels.slice(0, 4).map((model) => (
                <ModelCard key={model.id} model={model} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Showcase Pinning Section */}
      <section className="showcase-pin h-screen bg-[#000] overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <h2 className="text-6xl md:text-8xl font-bold text-gradient reveal-item">Unrivaled Quality.</h2>
        </div>
        <div className="showcase-track flex gap-10 px-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-[400px] h-[500px] glass rounded-[48px] p-4 group overflow-hidden">
              <img
                src={i % 2 === 0 ? '/assets/phone.png' : '/assets/materials.png'}
                className="w-full h-full object-cover rounded-[36px] grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* AI Studio Section */}
      <section className="py-32 px-6 reveal-group relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-violet-600/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="reveal-item">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-bold uppercase tracking-widest text-violet-400 mb-8">
              <Sparkles size={14} className="animate-pulse" />
              New Feature: AI Studio
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-gradient">
              Create Assets <br />with AI.
            </h2>
            <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
              Our new AI Studio allows you to generate professional 3D model previews, craft compelling descriptions, and auto-suggest tags using state-of-the-art Llama 3.3 models.
            </p>
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Instant Previews</h4>
                  <p className="text-zinc-500 text-sm">Generate high-quality preview images from simple text concepts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Smart Metadata</h4>
                  <p className="text-zinc-500 text-sm">Automate descriptions and tags to improve your asset's searchability.</p>
                </div>
              </div>
            </div>
            <Link
              href="/ai-studio"
              className="inline-flex items-center gap-3 bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-zinc-200 transition-all active:scale-95 group"
            >
              Enter AI Studio
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="relative reveal-item">
            <div className="glass-card p-4 rounded-[48px] border border-white/10 shadow-2xl overflow-hidden group">
              <img
                src="/assets/ai-studio-preview.png"
                alt="AI Studio Interface"
                className="w-full h-auto rounded-[36px] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-12">
                <p className="text-white font-medium">Ultra-fast inference powered by Groq</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 px-6 reveal-group">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-20 text-gradient reveal-item">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal-item">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={`/browse?category=${c.label}`}
                className="glass-card p-10 rounded-[40px] group hover:bg-white/[0.03] transition-all duration-500"
              >
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{c.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{c.label}</h3>
                <p className="text-zinc-500">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6 bg-white/[0.01] reveal-group">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 reveal-item">
            <h2 className="text-5xl font-bold mb-6 text-gradient">Simplicity at its core.</h2>
            <p className="text-xl text-zinc-500">Go from discovery to render in minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Discover', desc: 'Browse our curated collection of verified 3D assets.', icon: <Search size={32} /> },
              { step: '02', title: 'Acquire', desc: 'Directly download high-performance source files.', icon: <Download size={32} /> },
              { step: '03', title: 'Create', desc: 'Import into your workflow and start rendering.', icon: <Sparkles size={32} /> }
            ].map((s, i) => (
              <div key={i} className="reveal-item space-y-6">
                <div className="text-8xl font-black text-white/5">{s.step}</div>
                <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 text-violet-400">
                  {s.icon}
                </div>
                <h3 className="text-3xl font-bold">{s.title}</h3>
                <p className="text-zinc-500 text-lg leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Build CTA */}
      <section className="py-32 px-6 reveal-group">
        <div className="max-w-7xl mx-auto glass rounded-[60px] p-20 flex flex-col md:flex-row items-center gap-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="flex-1 z-10">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-gradient">Ready to contribute?</h2>
            <p className="text-2xl text-zinc-400 mb-12">Join our creator network and sell your assets to thousands of studios worldwide.</p>
            <Link href="/upload" className="bg-white text-black font-bold px-12 py-5 rounded-full text-lg hover:bg-zinc-200 transition-all inline-block">
              Start Selling Today
            </Link>
          </div>
          <div className="flex-1 z-10 flex justify-center">
            <div className="w-80 h-80 relative animate-float">
              <img src="/assets/bucket.png" alt="Bucket" className="w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(139,92,246,0.2)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div>
            <Link href="/" className="flex items-center gap-4 font-bold text-3xl tracking-tighter text-white mb-8">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                <span className="text-xl">⬡</span>
              </div>
              TriMesh
            </Link>
            <p className="text-zinc-500 max-w-sm text-lg leading-relaxed">The world's most advanced 3D marketplace for professional creators and digital studios.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-24">
            <div>
              <h4 className="font-bold mb-8 text-sm uppercase tracking-[0.2em] text-zinc-300">Platform</h4>
              <ul className="space-y-4 text-zinc-500 text-[15px] font-medium">
                <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
                <li><Link href="/upload" className="hover:text-white transition-colors">Upload</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Collections</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-sm uppercase tracking-[0.2em] text-zinc-300">Company</h4>
              <ul className="space-y-4 text-zinc-500 text-[15px] font-medium">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Studio</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8 text-zinc-600 text-[13px] font-bold uppercase tracking-widest">
          <p>© 2026 TriMesh Studio. All rights reserved.</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
