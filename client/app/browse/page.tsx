'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import CategoryFilter from '../../components/CategoryFilter';
import ModelGrid from '../../components/ModelGrid';
import { useModels } from '../../lib/hooks/useModels';

function BrowseContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const { models, loading, error } = useModels(category ?? undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategory(searchParams.get('category'));
  }, [searchParams]);

  useEffect(() => {
    if (!loading && models.length > 0) {
      gsap.from('.model-card-anim', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }, [loading, models]);

  return (
    <div ref={containerRef}>
      <div className="mb-12">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>
      {error ? (
        <div className="glass p-6 rounded-2xl text-red-400 text-center">
           <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {models.map((model) => (
             <div key={model.id} className="model-card-anim">
               <ModelGrid models={[model]} loading={loading} />
             </div>
           ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <main className="bg-[#030303] min-h-screen">
      {/* Browse Hero */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-hero-gradient opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-8 tracking-tighter">The Library.</h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Discover thousands of premium 3D assets, textures, and characters meticulously crafted for modern digital productions.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <Suspense fallback={<ModelGrid models={[]} loading />}>
          <BrowseContent />
        </Suspense>
      </div>
    </main>
  );
}
