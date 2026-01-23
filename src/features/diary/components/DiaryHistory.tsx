import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import type { PosterRecord } from '@/features/diary/diary.utils';
import { normalizeImageUrl } from '@/features/diary/diary.utils';

type DiaryHistoryProps = {
  history: PosterRecord[];
  currentId?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (record: PosterRecord) => void;
  onDelete: (id: string) => void;
};

export const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  history,
  currentId,
  isOpen,
  onToggle,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-4 lg:max-h-[320px] xl:max-h-none flex flex-col">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <h3 className="font-serif text-lg text-ink">生成历史</h3>
        <ChevronDown size={16} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          {history.length === 0 ? (
            <div className="text-xs text-stone-500 mt-3">暂无历史记录</div>
          ) : (
            <div className="relative flex-1 lg:overflow-hidden mt-3">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent lg:hidden z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent lg:hidden z-10" />
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth lg:block lg:space-y-3 lg:overflow-y-auto lg:h-full lg:pr-2">
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
                    className={`min-w-[240px] lg:min-w-0 w-full text-left border rounded-sm p-2 hover:bg-stone-50 snap-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40 ${
                      currentId === item.id ? 'border-stamp bg-red-50/30' : 'border-stone-100'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-sm overflow-hidden bg-stone-50 shrink-0 flex items-center justify-center">
                        {item.imageUrl && (
                          <img
                            src={normalizeImageUrl(item.imageUrl)}
                            alt={item.copyTitlePolished ?? item.copyTitle ?? '缩略图'}
                            className="w-full h-full object-contain object-center"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink line-clamp-1">
                          {item.copyTitlePolished ?? item.copyTitle ?? item.city ?? '未命名'}
                        </p>
                        <p className="text-xs text-stone-500 line-clamp-1">
                          {item.copySubtitlePolished ?? item.copySubtitle ?? item.theme ?? '未设置'}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="text-stone-400 hover:text-red-500 shrink-0"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
