import React, { useState } from 'react';
import { X, Heart, BookOpen, Quote } from 'lucide-react';

interface CultureModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    subtitle: string;
    description: string;
    detailedContent: string;
    tags: string[];
  };
}

export const CultureModal: React.FC<CultureModalProps> = ({ isOpen, onClose, data }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-paper rounded-sm shadow-2xl border border-stone-200 overflow-hidden animate-slide-up bg-texture">
        <div className="h-32 bg-ink relative overflow-hidden flex flex-col justify-end p-6">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(#8b1a10 1px, transparent 1px)', backgroundSize: '10px 10px' }}
          ></div>

          <div className="relative z-10 text-paper">
            <div className="flex gap-2 mb-2">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] border border-white/20 bg-white/10 px-2 py-0.5 rounded-sm backdrop-blur-md tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-serif font-bold tracking-wide">{data.title}</h2>
            <p className="text-xs text-stone-300 font-sans tracking-[0.2em] uppercase mt-1">{data.subtitle}</p>
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors p-2">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 relative">
          <div className="absolute -top-6 right-8 w-12 h-12 bg-stamp text-white rounded-full flex items-center justify-center shadow-lg border-4 border-paper text-xl font-serif font-bold transform rotate-12">
            印
          </div>

          <div className="mb-6 pt-2">
            <h3 className="text-sm font-bold text-stamp mb-3 flex items-center gap-2 font-serif">
              <BookOpen size={16} /> 深度解读
            </h3>
            <p className="text-ink font-serif leading-relaxed text-sm text-justify">{data.description}</p>
          </div>

          <div className="bg-stone-50 p-5 border-l-2 border-stone-300 mb-8 relative">
            <Quote size={24} className="absolute -top-3 -left-3 text-stone-200 bg-stone-50 p-1" />
            <p className="italic text-stone-600 text-xs leading-relaxed font-serif text-justify">{data.detailedContent}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex-1 py-3.5 rounded-sm border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-red-50 border-red-200 text-red-600 shadow-inner'
                  : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-pulse' : ''} />
              <span className="text-xs font-bold tracking-wide">{isFavorite ? '已收藏' : '收藏词条'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
