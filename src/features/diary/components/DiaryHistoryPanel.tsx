import React from 'react';
import { Download, MoreHorizontal, Trash2 } from 'lucide-react';
import type { PosterRecord } from '@/features/diary/diary.utils';
import { normalizeImageUrl } from '@/features/diary/diary.utils';

type DiaryHistoryPanelProps = {
  history: PosterRecord[];
  currentId?: string;
  onSelect: (record: PosterRecord) => void;
  onDelete: (id: string) => void;
  onDownload: (record: PosterRecord) => void;
};

const pickTitle = (record: PosterRecord) =>
  record.copyTitlePolished || record.copyTitle || record.copyTitleRaw || record.city || '未命名';

const pickSubtitle = (record: PosterRecord) =>
  record.copySubtitlePolished || record.copySubtitle || record.copySubtitleRaw || record.theme || '';

export const DiaryHistoryPanel: React.FC<DiaryHistoryPanelProps> = ({
  history,
  currentId,
  onSelect,
  onDelete,
  onDownload,
}) => {
  return (
    <aside className="w-80 h-full bg-white border-l border-brand-200 flex flex-col z-10 hidden xl:flex">
      <div className="p-6 border-b border-brand-200 flex justify-between items-center">
        <div className="flex items-center gap-2 text-brand-900 font-display font-semibold">
          <span>创作时间轴</span>
        </div>
        <button className="text-stone-400 hover:text-brand-900" title="更多">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {history.length === 0 && <div className="text-xs text-stone-400">暂无历史记录</div>}
        {history.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(item);
              }
            }}
            className={`group relative bg-brand-50 border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 ${
              currentId === item.id ? 'border-brand-accent' : 'border-brand-100 hover:border-brand-300'
            }`}
          >
            <div className="aspect-[3/2] overflow-hidden relative">
              {item.imageUrl ? (
                <img
                  src={normalizeImageUrl(item.imageUrl)}
                  alt={pickTitle(item)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 bg-white">
                  无图片
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-[-10px] group-hover:translate-y-0 duration-300">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownload(item);
                  }}
                  className="p-1.5 bg-white/90 rounded-md shadow-sm text-stone-600 hover:text-brand-accent"
                  title="下载"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1.5 bg-white/90 rounded-md shadow-sm text-stone-600 hover:text-red-600"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-display font-medium text-brand-900 text-sm truncate">{pickTitle(item)}</h3>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-stone-500 truncate">{pickSubtitle(item)}</p>
                <span className="text-[10px] text-stone-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
