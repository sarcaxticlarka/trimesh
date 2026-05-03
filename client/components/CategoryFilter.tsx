'use client';

import { CATEGORIES } from '../types';

interface Props {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onChange(null)}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
          selected === null
            ? 'bg-white text-black shadow-lg shadow-white/10'
            : 'glass text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
      >
        All Models
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            selected === cat
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
              : 'glass text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
