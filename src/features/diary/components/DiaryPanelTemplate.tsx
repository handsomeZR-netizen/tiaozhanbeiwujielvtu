import React from 'react';
import { ChevronDown, Tag } from 'lucide-react';
import { templates } from '@/features/diary/diary.data';

type DiaryPanelTemplateProps = {
  templateId: string;
  panelOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

export const DiaryPanelTemplate: React.FC<DiaryPanelTemplateProps> = ({
  templateId,
  panelOpen,
  onToggle,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5 lg:col-span-2">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2 text-stone-600">
          <Tag size={16} className="text-stamp" />
          <h2 className="font-serif text-lg text-ink">模板选择</h2>
        </div>
        <ChevronDown size={16} className={`text-stone-400 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
      </button>
      {panelOpen && (
        <div className="relative mt-4">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent md:hidden" />
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-5 md:gap-3 md:overflow-visible">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template.id)}
                className={`min-w-[140px] md:min-w-0 rounded-sm border p-3 text-left snap-center ${
                  templateId === template.id ? 'border-stamp bg-red-50/60' : 'border-stone-200'
                }`}
              >
                <div className="h-2 w-8 rounded-full mb-2" style={{ backgroundColor: template.accent }} />
                <p className="text-sm font-semibold text-ink">{template.name}</p>
                <p className="text-xs text-stone-500 mt-1">{template.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
