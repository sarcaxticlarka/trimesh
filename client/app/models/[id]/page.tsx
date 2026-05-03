'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import api from '../../../lib/api';
import { Model } from '../../../types';
import { useUser } from '../../../lib/hooks/useUser';

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Model>(`/api/models/${id}`)
      .then((res) => setModel(res.data))
      .catch(() => router.push('/browse'))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!loading && model) {
      gsap.from('.detail-reveal', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }, [loading, model]);

  const handleSave = async () => {
    if (!user) { router.push('/login'); return; }
    setSavingLoading(true);
    try {
      if (saved) {
        await api.delete(`/api/user/save/${id}`);
        setSaved(false);
      } else {
        await api.post(`/api/user/save/${id}`);
        setSaved(true);
      }
    } finally {
      setSavingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this model permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/models/${id}`);
      router.push('/dashboard');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 animate-pulse">
        <div className="aspect-video glass rounded-[40px] mb-12" />
        <div className="grid lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-6">
              <div className="h-12 glass rounded-full w-3/4" />
              <div className="h-6 glass rounded-full w-full" />
              <div className="h-6 glass rounded-full w-1/2" />
           </div>
           <div className="h-64 glass rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!model) return null;

  const isOwner = user?.id === model.userId;

  return (
    <main ref={containerRef} className="max-w-7xl mx-auto px-6 py-32">
      <Link href="/browse" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors group detail-reveal">
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Library
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Side: Visuals & Info */}
        <div className="lg:col-span-2 space-y-12">
          <div className="detail-reveal relative group glass rounded-[48px] overflow-hidden">
            <img
              src={model.previewImage}
              alt={model.title}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>

          <div className="space-y-8">
            <div className="detail-reveal">
              <div className="flex items-center gap-4 mb-6">
                 <span className="bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-violet-600/20">
                    {model.category}
                 </span>
                 <div className="h-px flex-1 bg-white/5" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6 leading-[1.1]">{model.title}</h1>
              <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">{model.description}</p>
            </div>

            {model.tags.length > 0 && (
              <div className="detail-reveal flex flex-wrap gap-3">
                {model.tags.map((tag) => (
                  <span key={tag} className="glass px-5 py-2 rounded-full text-sm font-medium text-zinc-500 hover:text-white transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions Card */}
        <div className="space-y-6">
          <div className="detail-reveal glass-card p-10 rounded-[40px] sticky top-32">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-lg font-bold">
                  {model.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                   <p className="text-sm text-zinc-500">Created by</p>
                   <p className="font-bold text-white">{model.user.username}</p>
                </div>
             </div>

             <div className="space-y-4 mb-10">
                <div className="flex justify-between py-4 border-y border-white/5">
                   <span className="text-zinc-500">Downloads</span>
                   <span className="text-white font-bold">{model.downloadCount}</span>
                </div>
                <div className="flex justify-between py-2">
                   <span className="text-zinc-500">Status</span>
                   <span className="text-emerald-400 font-bold">Verified</span>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                {model.fileUrl && (
                  <a
                    href={model.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-black text-center py-5 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                  >
                    Download Model
                  </a>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={savingLoading}
                  className={`w-full py-5 rounded-2xl font-bold transition-all border detail-reveal ${
                    saved
                      ? 'bg-violet-600/10 border-violet-600/20 text-violet-400'
                      : 'glass border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  {saved ? 'Saved in Collection' : 'Add to Collection'}
                </button>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full py-4 text-red-500 font-bold text-sm hover:text-red-400 transition-colors mt-4"
                  >
                    Delete Permanently
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
