import React from 'react';
import { Sparkles } from 'lucide-react';

export const DiaryHeader: React.FC = () => {
  return (
    <header className="pt-8 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-red-50 text-stamp flex items-center justify-center shadow-float">
          <Sparkles size={18} />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink">海报工坊</h1>
          <p className="text-xs text-stone-500 tracking-[0.2em] uppercase">旅行叙事</p>
        </div>
      </div>
      <p className="text-sm text-stone-500 leading-6">
        选择模板与平台，一键生成适合分享的旅行海报。
      </p>
    </header>
  );
};
