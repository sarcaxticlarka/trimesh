'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import api from '../../lib/api';
import { useUser } from '../../lib/hooks/useUser';

interface Stats {
  uploads: number;
  saved: number;
  totalDownloads: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useUser();
  const pageRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    api.get<Stats>('/api/user/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.settings-reveal', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await api.patch('/api/user/profile', { username, bio });
      setUser((prev: any) => ({ ...prev, ...res.data }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full glass-input rounded-2xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none text-sm';

  return (
    <div ref={pageRef} className="bg-[#030303] min-h-screen pt-24">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12 settings-reveal">
          <h1 className="text-5xl font-bold text-gradient tracking-tighter mb-3">Settings.</h1>
          <p className="text-zinc-500">Manage your profile and account preferences.</p>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-10 settings-reveal">
            {[
              { label: 'Models Uploaded', value: stats.uploads },
              { label: 'Saved Models', value: stats.saved },
              { label: 'Total Downloads', value: stats.totalDownloads },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-5 border border-white/5 text-center">
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Profile Form */}
        <div className="glass-card rounded-[32px] p-8 border border-white/5 mb-6 settings-reveal">
          <h2 className="text-lg font-bold text-white mb-6">Profile</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
              <div className={`${inputClass} opacity-40 cursor-not-allowed`}>{user?.email}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Bio <span className="text-zinc-700 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a bit about yourself..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wider uppercase hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-40"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </span>
              ) : success ? '✓ Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="glass-card rounded-[32px] p-8 border border-white/5 mb-6 settings-reveal">
          <h2 className="text-lg font-bold text-white mb-5">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard', icon: '⬡', label: 'Dashboard', desc: 'Your uploads & saved' },
              { href: '/upload', icon: '↑', label: 'Upload Model', desc: 'Share a new asset' },
              { href: '/ai-studio', icon: '✦', label: 'AI Studio', desc: 'Generate with Groq AI' },
              { href: '/browse', icon: '◈', label: 'Browse', desc: 'Explore the library' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="glass rounded-2xl p-4 border border-white/5 hover:border-white/15 transition-all group"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{item.label}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-[32px] p-8 border border-red-500/10 settings-reveal">
          <h2 className="text-lg font-bold text-red-400 mb-5">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Sign out of TriMesh</p>
              <p className="text-xs text-zinc-600 mt-0.5">You can log back in at any time.</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 active:scale-95 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
