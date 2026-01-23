import React from 'react';
import { Brush, ChevronDown, Languages } from 'lucide-react';
import { styles } from '@/features/diary/diary.data';
import type { PosterForm } from '@/features/diary/diary.utils';

type DiaryPanelStyleProps = {
  form: PosterForm;
  panelOpen: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PosterForm>) => void;
};

export const DiaryPanelStyle: React.FC<DiaryPanelStyleProps> = ({ form, panelOpen, onToggle, onChange }) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5 lg:col-span-1">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2 text-stone-600">
          <Brush size={16} className="text-stamp" />
          <h2 className="font-serif text-lg text-ink">视觉风格</h2>
        </div>
        <ChevronDown size={16} className={`text-stone-400 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
      </button>
      {panelOpen && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">风格</label>
            <select
              value={form.style}
              onChange={(event) => onChange({ style: event.target.value })}
              className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {styles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">语言</label>
            <div className="mt-2 flex gap-2">
              {[
                { id: 'zh', label: '中文' },
                { id: 'en', label: '英文' },
                { id: 'bilingual', label: '中英' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChange({ language: item.id as PosterForm['language'] })}
                  className={`flex-1 rounded-sm border px-3 py-2 text-xs ${
                    form.language === item.id ? 'border-stamp text-stamp bg-red-50' : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <Languages size={12} className="inline mr-1" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
