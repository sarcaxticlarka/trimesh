'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

type Tab = 'generate' | 'enhance' | 'tags';

interface GenerateResult {
  imagePrompt: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

interface EnhanceResult {
  description: string;
  tags: string[];
}

type Result = GenerateResult | EnhanceResult | { tags: string[] } | null;

const CATEGORIES = ['Gaming', 'Architecture', 'VR/AR', 'Animation', 'Product Design', 'Digital Art'];

export default function AIStudioPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  // Generate tab state
  const [concept, setConcept] = useState('');
  const [genCategory, setGenCategory] = useState('Gaming');

  // Enhance tab state
  const [enhTitle, setEnhTitle] = useState('');
  const [enhCategory, setEnhCategory] = useState('Gaming');

  // Tags tab state
  const [tagsDesc, setTagsDesc] = useState('');
  const [tagsCategory, setTagsCategory] = useState('Gaming');

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.studio-reveal', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power4.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const callAI = async (action: string, payload: object) => {
    setLoading(true);
    setResult(null);
    if (action === 'generate') setImgLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      alert(err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const useInUpload = () => {
    if (!result) return;
    const r = result as any;
    
    // Use sessionStorage for the large image data to avoid URL length limits
    if (r.imageUrl) {
      sessionStorage.setItem('pendingPreviewImage', r.imageUrl);
    }

    const params = new URLSearchParams({
      description: r.description || '',
      tags: (r.tags || []).join(', '),
      category: genCategory,
    });
    router.push(`/upload?${params.toString()}`);
  };

  const inputClass =
    'w-full glass-input rounded-2xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none text-sm';
  const selectClass =
    'w-full glass-input rounded-2xl px-5 py-4 text-white focus:outline-none text-sm bg-transparent cursor-pointer';
  const btnPrimary =
    'w-full py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wider uppercase hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-40 disabled:cursor-not-allowed';

  const tabs: { id: Tab; label: string; icon: string; desc: string }[] = [
    { id: 'generate', label: 'Image Generator', icon: '🎨', desc: 'Turn a concept into a preview image + description' },
    { id: 'enhance', label: 'Description AI', icon: '✍️', desc: 'Write a professional listing from a title' },
    { id: 'tags', label: 'Tag Suggester', icon: '🏷️', desc: 'Auto-generate relevant tags from a description' },
  ];

  return (
    <div ref={heroRef} className="bg-[#030303] min-h-screen pt-24">
      {/* Header */}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-bold uppercase tracking-widest text-violet-400 mb-8 studio-reveal">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Powered by Groq × Llama 3.3
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gradient mb-6 studio-reveal">
            AI Studio.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed studio-reveal">
            Generate stunning 3D model preview images, write professional descriptions, and auto-suggest tags — all powered by Groq's ultra-fast AI.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 studio-reveal">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResult(null); }}
              className={`flex-1 p-5 rounded-2xl border text-left transition-all group ${
                tab === t.id
                  ? 'border-violet-500/50 bg-violet-500/10'
                  : 'border-white/5 glass hover:border-white/15'
              }`}
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className={`font-bold text-sm mb-1 ${tab === t.id ? 'text-white' : 'text-zinc-400'}`}>
                {t.label}
              </p>
              <p className="text-xs text-zinc-600">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="glass-card rounded-[32px] p-8 border border-white/5 studio-reveal">
            <h2 className="text-lg font-bold text-white mb-6">
              {tab === 'generate' && 'Describe your concept'}
              {tab === 'enhance' && 'Enter model title'}
              {tab === 'tags' && 'Paste your description'}
            </h2>

            {tab === 'generate' && (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g. A futuristic cyborg warrior with glowing blue circuits, battle-worn armor, highly detailed sci-fi character..."
                  className={`${inputClass} resize-none`}
                />
                <select value={genCategory} onChange={(e) => setGenCategory(e.target.value)} className={selectClass}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
                <button
                  disabled={loading || !concept.trim()}
                  onClick={() => callAI('generate', { prompt: concept, category: genCategory })}
                  className={btnPrimary}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Generating with Groq...
                    </span>
                  ) : '✦ Generate Preview Image'}
                </button>
              </div>
            )}

            {tab === 'enhance' && (
              <div className="space-y-4">
                <input
                  value={enhTitle}
                  onChange={(e) => setEnhTitle(e.target.value)}
                  placeholder="e.g. Medieval Castle Interior"
                  className={inputClass}
                />
                <select value={enhCategory} onChange={(e) => setEnhCategory(e.target.value)} className={selectClass}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
                <button
                  disabled={loading || !enhTitle.trim()}
                  onClick={() => callAI('enhance', { title: enhTitle, category: enhCategory })}
                  className={btnPrimary}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Writing with AI...
                    </span>
                  ) : '✦ Write Description'}
                </button>
              </div>
            )}

            {tab === 'tags' && (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={tagsDesc}
                  onChange={(e) => setTagsDesc(e.target.value)}
                  placeholder="Paste your model description here to generate relevant tags..."
                  className={`${inputClass} resize-none`}
                />
                <select value={tagsCategory} onChange={(e) => setTagsCategory(e.target.value)} className={selectClass}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
                <button
                  disabled={loading || !tagsDesc.trim()}
                  onClick={() => callAI('tags', { description: tagsDesc, category: tagsCategory })}
                  className={btnPrimary}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : '✦ Suggest Tags'}
                </button>
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="glass-card rounded-[32px] p-8 border border-white/5 studio-reveal">
            <h2 className="text-lg font-bold text-white mb-6">AI Output</h2>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-700">
                <div className="text-6xl mb-4">✦</div>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
                <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
                <p className="text-sm">Groq is thinking...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-5 h-full">
                {/* Generated Image */}
                {'imageUrl' in result && result.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-900">
                    {imgLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={result.imageUrl}
                      alt="AI generated preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setImgLoading(false)}
                      onError={() => setImgLoading(false)}
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => copy(result.imageUrl, 'img')}
                        className="glass text-xs px-3 py-1.5 rounded-full text-white font-medium hover:bg-white/10 transition"
                      >
                        {copied === 'img' ? '✓ Copied' : 'Copy URL'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Prompt */}
                {'imagePrompt' in result && result.imagePrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Image Prompt</p>
                      <button onClick={() => copy(result.imagePrompt, 'prompt')} className="text-xs text-violet-400 hover:text-violet-300">
                        {copied === 'prompt' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 glass rounded-xl p-3 leading-relaxed">{result.imagePrompt}</p>
                  </div>
                )}

                {/* Description */}
                {'description' in result && result.description && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</p>
                      <button onClick={() => copy(result.description, 'desc')} className="text-xs text-violet-400 hover:text-violet-300">
                        {copied === 'desc' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-zinc-300 glass rounded-xl p-4 leading-relaxed">{result.description}</p>
                  </div>
                )}

                {/* Tags */}
                {'tags' in result && result.tags.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tags</p>
                      <button onClick={() => copy(result.tags.join(', '), 'tags')} className="text-xs text-violet-400 hover:text-violet-300">
                        {copied === 'tags' ? '✓ Copied' : 'Copy all'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag: string) => (
                        <span key={tag} className="text-xs glass px-3 py-1.5 rounded-full text-zinc-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Use in Upload CTA */}
                {tab === 'generate' && 'imageUrl' in result && (
                  <button
                    onClick={useInUpload}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm tracking-wider uppercase active:scale-95 transition-all"
                  >
                    → Use in Upload Form
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom tip */}
        <p className="text-center text-zinc-700 text-xs mt-10 studio-reveal">
          Images powered by Cloudflare Workers AI · Text powered by Groq × Llama 3.3 70B · Ultra-low latency inference
        </p>
      </div>
    </div>
  );
}
