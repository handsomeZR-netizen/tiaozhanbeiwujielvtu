import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { platforms, sizes } from '@/features/diary/diary.data';
import type { PosterForm } from '@/features/diary/diary.utils';

type DiaryPanelPlatformProps = {
  form: PosterForm;
  panelOpen: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PosterForm>) => void;
};

export const DiaryPanelPlatform: React.FC<DiaryPanelPlatformProps> = ({ form, panelOpen, onToggle, onChange }) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5 lg:col-span-1">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2 text-stone-600">
          <Globe size={16} className="text-stamp" />
          <h2 className="font-serif text-lg text-ink">发布平台</h2>
        </div>
        <ChevronDown size={16} className={`text-stone-400 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
      </button>
      {panelOpen && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">平台</label>
            <select
              value={form.platform}
              onChange={(event) => onChange({ platform: event.target.value })}
              className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {platforms.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">尺寸</label>
            <select
              value={form.size}
              onChange={(event) => onChange({ size: event.target.value })}
              className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {sizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
