import { Model } from '../types';
import ModelCard from './ModelCard';

interface Props {
  models: Model[];
  loading?: boolean;
}

export default function ModelGrid({ models, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-[32px] overflow-hidden animate-pulse">
            <div className="aspect-video bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="h-6 bg-white/5 rounded-full w-3/4" />
              <div className="h-4 bg-white/5 rounded-full w-full" />
              <div className="h-4 bg-white/5 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <span className="text-5xl mb-4">📭</span>
        <p className="text-lg font-medium">No models found</p>
        <p className="text-sm mt-1">Try a different category or upload the first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {models.map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}
