import React from 'react';
import { Download } from 'lucide-react';
import type { PosterRecord } from '@/features/diary/diary.utils';
import { normalizeImageUrl } from '@/features/diary/diary.utils';

type DiaryPreviewProps = {
  current: PosterRecord | null;
  previewAspectRatio: number;
  onCopyText: () => void;
  onDownload: () => void;
};

export const DiaryPreview: React.FC<DiaryPreviewProps> = ({ current, previewAspectRatio, onCopyText, onDownload }) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5 flex flex-col lg:overflow-hidden xl:row-span-1">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="font-serif text-lg text-ink">预览</h3>
        <div className="flex items-center gap-2">
          <button onClick={onCopyText} className="text-xs text-stone-500 hover:text-ink">
            复制文案
          </button>
          <button onClick={onDownload} className="text-xs text-stone-500 hover:text-ink flex items-center gap-1">
            <Download size={12} /> 下载
          </button>
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-sm border border-stone-100 bg-stone-50 w-full shadow-[0_25px_80px_-40px_rgba(0,0,0,0.65)] flex items-center justify-center"
        style={{ aspectRatio: previewAspectRatio }}
      >
        {current?.imageUrl ? (
          <>
            <img
              src={normalizeImageUrl(current.imageUrl)}
              alt={current.copyTitle ?? '预览图'}
              className="w-full h-full object-contain object-center block"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h4 className="font-serif text-lg">{current.copyTitle}</h4>
              <p className="text-xs opacity-80 mt-1">{current.copySubtitle}</p>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-stone-400">
            尚未生成海报
          </div>
        )}
      </div>
      {current?.prompt && (
        <p className="text-[11px] text-stone-400 mt-3 line-clamp-2 shrink-0">提示词：{current.prompt}</p>
      )}
    </div>
  );
};
