import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { themes } from '@/features/diary/diary.data';
import type { PosterForm } from '@/features/diary/diary.utils';

type DiaryPanelBasicProps = {
  form: PosterForm;
  panelOpen: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PosterForm>) => void;
};

export const DiaryPanelBasic: React.FC<DiaryPanelBasicProps> = ({ form, panelOpen, onToggle, onChange }) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5 lg:col-span-2">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2 text-stone-600">
          <MapPin size={16} className="text-stamp" />
          <h2 className="font-serif text-lg text-ink">基础信息</h2>
        </div>
        <ChevronDown size={16} className={`text-stone-400 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
      </button>
      {panelOpen && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">城市</label>
            <input
              value={form.city}
              onChange={(event) => onChange({ city: event.target.value })}
              className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp/30"
              placeholder="例如：杭州"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">主题</label>
            <select
              value={form.theme}
              onChange={(event) => onChange({ theme: event.target.value })}
              className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {themes.map((item) => (
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
