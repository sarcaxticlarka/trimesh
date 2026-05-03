'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import { DashboardData, Model } from '../../types';
import ModelCard from '../../components/ModelCard';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'uploads' | 'saved'>('uploads');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = () => {
    setLoading(true);
    api.get<DashboardData>('/api/user/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  const handleDeleteModel = async (id: string) => {
    try {
      await api.delete(`/api/models/${id}`);
      // Refresh local data
      if (data) {
        setData({
          ...data,
          uploads: data.uploads.filter(m => m.id !== id),
          saved: data.saved.filter(m => m.id !== id)
        });
      }
    } catch (err) {
      alert('Failed to delete model');
    }
  };

  const models: Model[] = data ? data[tab] : [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-zinc-400">Manage your 3D assets and bookmarks</p>
        </div>
        <Link
          href="/upload"
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/20 active:scale-95 text-center"
        >
          + Upload New Model
        </Link>
      </div>

      <div className="flex gap-4 mb-10 p-1.5 glass rounded-2xl w-fit">
        {(['uploads', 'saved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-8 py-3 text-sm font-bold capitalize transition-all rounded-xl ${
              tab === t
                ? 'bg-white text-black shadow-lg'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            {t}
            {data && (
              <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${tab === t ? 'bg-zinc-100 text-zinc-600' : 'bg-white/5 text-zinc-500'}`}>
                {data[t].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-[32px] overflow-hidden animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-white/5 rounded-full w-3/4" />
                <div className="h-4 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 glass rounded-[48px] text-zinc-500 text-center px-6">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
             {tab === 'uploads' ? '📤' : '🔖'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {tab === 'uploads' ? 'No uploads yet' : 'No saved models yet'}
          </h2>
          <p className="max-w-xs mb-8">
            {tab === 'uploads' 
              ? 'Start sharing your creative 3D work with the world today.' 
              : 'Browse our collection and save your favorite assets here.'}
          </p>
          {tab === 'uploads' ? (
            <Link href="/upload" className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-zinc-200 transition-all">
              Upload your first model
            </Link>
          ) : (
            <Link href="/browse" className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-zinc-200 transition-all">
              Browse Models
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {models.map((model) => (
            <ModelCard 
              key={model.id} 
              model={model} 
              onDelete={tab === 'uploads' ? handleDeleteModel : undefined} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
