import Link from 'next/link';
import { Model } from '../types';
import { Trash2 } from 'lucide-react';

interface Props {
  model: Model;
  onDelete?: (id: string) => void;
}

export default function ModelCard({ model, onDelete }: Props) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this model?')) {
      onDelete(model.id);
    }
  };

  return (
    <Link href={`/models/${model.id}`} className="group glass glass-hover block rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 relative">
      <div className="aspect-video w-full overflow-hidden bg-white/5 relative">
        <img
          src={model.previewImage}
          alt={model.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-600 text-white px-2.5 py-1 rounded-full shadow-lg shadow-violet-600/30">
            {model.category}
          </span>
        </div>

        {onDelete && (
          <button 
            onClick={handleDelete}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">{model.title}</h3>
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">{model.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-[10px] font-bold">
              {model.user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-xs text-zinc-500">by {model.user?.username || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
             <span>📥</span>
             <span>{model.downloadCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
