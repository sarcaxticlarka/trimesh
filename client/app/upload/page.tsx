'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import api from '../../lib/api';
import { CATEGORIES } from '../../types';

function UploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    title: '',
    description: searchParams.get('description') || '',
    category: searchParams.get('category') || CATEGORIES[0],
    previewImage: searchParams.get('previewImage') || '',
    fileUrl: '',
    tags: searchParams.get('tags') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prefilled, setPrefilled] = useState(() => !!searchParams.get('description'));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for image data in sessionStorage (from AI Studio)
    const storedImage = sessionStorage.getItem('pendingPreviewImage');
    if (storedImage) {
      setForm(prev => ({ ...prev, previewImage: storedImage }));
      setPrefilled(true);
      // Optional: Clear it so it doesn't persist across fresh uploads
      sessionStorage.removeItem('pendingPreviewImage');
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.upload-reveal', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.post<{ id: string }>('/api/models', {
        title: form.title,
        description: form.description,
        category: form.category,
        previewImage: form.previewImage,
        fileUrl: form.fileUrl || undefined,
        tags,
      });
      router.push(`/models/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload model');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full glass bg-white/5 px-6 py-4 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border-white/5 text-base';

  return (
    <main ref={containerRef} className="max-w-4xl mx-auto px-6 py-32">
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-bold text-gradient mb-6 upload-reveal">Upload Artwork.</h1>
        <p className="text-zinc-400 text-xl max-w-xl mx-auto upload-reveal">Share your professional 3D creations with the TriMesh community and reach thousands of studios.</p>
        {prefilled && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-bold text-violet-400 upload-reveal">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Pre-filled from AI Studio
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="upload-reveal glass-card p-10 md:p-16 rounded-[48px] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-6 py-4 rounded-2xl animate-shake">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Title *</label>
            <input name="title" required value={form.title} onChange={handleChange} placeholder="Cyberpunk Character" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Description *</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Technical details, polycount, and features..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Preview Image URL *</label>
              <input
                name="previewImage"
                required
                value={form.previewImage}
                onChange={handleChange}
                placeholder="https://imgur.com/xyz.png or base64"
                className={inputClass}
              />
            </div>
            
            {form.previewImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden glass border border-white/10 group">
                <img 
                  src={form.previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Image Preview</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
              File URL <span className="text-zinc-600 lowercase font-normal">(drive, dropbox, etc)</span>
            </label>
            <input
              name="fileUrl"
              type="url"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
            Tags <span className="text-zinc-600 lowercase font-normal">(comma-separated)</span>
          </label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="unreal, highpoly, pbr, industrial"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-60 font-bold py-6 rounded-[24px] text-lg transition-all shadow-2xl shadow-white/5 active:scale-[0.98] mt-10"
        >
          {loading ? (
             <div className="flex items-center justify-center gap-3">
               <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
               <span>Publishing to Gallery...</span>
             </div>
          ) : 'Publish Model'}
        </button>
      </form>
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadForm />
    </Suspense>
  );
}
