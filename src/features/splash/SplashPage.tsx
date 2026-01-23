import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const SplashPage: React.FC<SplashProps> = ({ onComplete, onSkip }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-paper z-50 flex items-center justify-center p-4 sm:p-6 text-center bg-texture overflow-hidden">
      <div className="absolute inset-4 border border-stone-300 pointer-events-none opacity-50 m-2" />
      <div className="absolute inset-5 border border-stone-300 pointer-events-none opacity-50 m-2" />

      {/* 使用 grid 布局让内容紧凑 */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center h-full max-h-screen py-4">
        
        {/* Logo 和标题 - 缩小间距 */}
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-stamp rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-paper border-4 border-double border-paper ring-1 ring-stone-200">
            <Globe className="text-paper w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink mb-1 tracking-wide">无界旅图</h1>
          <p className="text-stone-500 tracking-[0.3em] uppercase text-[10px] font-sans">城市文化视觉引擎</p>
        </div>

        {/* 照片卡片 - 缩小尺寸和间距 */}
        <div className={`w-full max-w-[240px] sm:max-w-[280px] relative aspect-[4/5] bg-white shadow-float p-2 sm:p-3 my-4 sm:my-6 rotate-1 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-16 bg-stone-200/50 backdrop-blur rotate-90 z-20"></div>
          <div className="w-full h-full border border-stone-100 bg-stone-50 relative overflow-hidden group">
            <img
              src="https://picsum.photos/400/500?grayscale"
              className="w-full h-full object-cover opacity-90 sepia-[0.2]"
              alt="示例照片"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-left w-full">
                <div className="w-6 h-0.5 bg-white/50 mb-1"></div>
                <p className="text-stone-300 text-[9px] uppercase tracking-widest mb-0.5">旧城 vs 新城</p>
                <p className="text-white font-serif text-sm sm:text-base leading-relaxed italic">让一张照片，读出一座城的记忆。</p>
              </div>
            </div>

            <div className="absolute top-3 right-3 animate-float">
              <div className="bg-stamp text-white text-[9px] font-bold px-2 py-0.5 shadow-md -rotate-3 tracking-widest border border-white/20">
                初印
              </div>
            </div>
          </div>
        </div>

        {/* 按钮组 - 缩小间距 */}
        <div className={`w-full max-w-xs space-y-3 transition-opacity duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={onComplete}
            className="w-full bg-ink text-paper py-3 sm:py-3.5 rounded-sm font-serif text-base sm:text-lg tracking-widest shadow-lg active:scale-95 transition-all hover:bg-black flex items-center justify-center gap-2 group"
          >
            开启旅程<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onSkip}
            className="text-stone-400 text-xs hover:text-stamp tracking-wider transition-colors border-b border-transparent hover:border-stamp pb-0.5"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
};
