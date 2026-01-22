import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete, onSkip }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-paper z-50 overflow-y-auto flex flex-col items-center justify-center p-6 text-center bg-texture">
      {/* Decorative Border */}
      <div className="absolute inset-4 border border-stone-300 pointer-events-none opacity-50 m-2" />
      <div className="absolute inset-5 border border-stone-300 pointer-events-none opacity-50 m-2" />

      <div className={`relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="w-20 h-20 bg-stamp rounded-full mx-auto mb-6 flex items-center justify-center shadow-paper border-4 border-double border-paper ring-1 ring-stone-200">
            <Globe className="text-paper w-10 h-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-ink mb-2 tracking-wide">无界旅图</h1>
        <p className="text-stone-500 tracking-[0.3em] uppercase text-xs font-sans">Boundless Lens</p>
      </div>

      <div className={`w-full max-w-xs relative aspect-[4/5] bg-white shadow-float p-3 my-10 rotate-1 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-20 bg-stone-200/50 backdrop-blur rotate-90 z-20"></div> {/* Tape effect */}
        <div className="w-full h-full border border-stone-100 bg-stone-50 relative overflow-hidden group">
            <img 
                src="https://picsum.photos/400/500?grayscale" 
                className="w-full h-full object-cover opacity-90 sepia-[0.2]"
                alt="Old China"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-left w-full">
                    <div className="w-8 h-0.5 bg-white/50 mb-2"></div>
                    <p className="text-stone-300 text-[10px] uppercase tracking-widest mb-1">Impression vs Reality</p>
                    <p className="text-white font-serif text-lg leading-relaxed italic">"我以为是古老..."</p>
                </div>
            </div>
            
            {/* Animated Reveal Tag */}
            <div className="absolute top-4 right-4 animate-float">
                <div className="bg-stamp text-white text-[10px] font-bold px-3 py-1 shadow-md -rotate-3 tracking-widest border border-white/20">
                    样例数据
                </div>
            </div>
        </div>
      </div>

      <div className={`w-full max-w-xs space-y-4 pb-8 transition-opacity duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <button 
            onClick={onComplete}
            className="w-full bg-ink text-paper py-4 rounded-sm font-serif text-lg tracking-widest shadow-lg active:scale-95 transition-all hover:bg-black flex items-center justify-center gap-3 group"
        >
          开启旅程 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
        </button>
        <button 
            onClick={onSkip}
            className="text-stone-400 text-xs hover:text-stamp tracking-wider transition-colors border-b border-transparent hover:border-stamp pb-0.5"
        >
          观看演示路线 (路演模式)
        </button>
      </div>
    </div>
  );
};