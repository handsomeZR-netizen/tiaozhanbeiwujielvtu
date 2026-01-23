import React from 'react';
import { Download, Maximize2, Quote, Share2 } from 'lucide-react';
import type { PosterRecord, ThinkingStep } from '@/features/diary/diary.utils';
import { normalizeImageUrl } from '@/features/diary/diary.utils';
import { DiaryThinkingOverlay } from '@/features/diary/components/DiaryThinkingOverlay';

type DiaryCanvasProps = {
  current: PosterRecord | null;
  previewAspectRatio: number;
  isGenerating: boolean;
  thinkingSteps: ThinkingStep[];
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  shareFolded: boolean;
  sharePreview?: string;
  onExpandShare: () => void;
  onCopyText: () => void;
  onDownload: () => void;
};

const pickTitle = (record: PosterRecord | null, fallback?: string) =>
  record?.copyTitlePolished ||
  record?.copyTitle ||
  record?.copyTitleRaw ||
  record?.city ||
  fallback ||
  '旅行海报';

const pickSubtitle = (record: PosterRecord | null, fallback?: string) =>
  record?.copySubtitlePolished ||
  record?.copySubtitle ||
  record?.copySubtitleRaw ||
  record?.theme ||
  fallback ||
  '';

export const DiaryCanvas: React.FC<DiaryCanvasProps> = ({
  current,
  previewAspectRatio,
  isGenerating,
  thinkingSteps,
  fallbackTitle,
  fallbackSubtitle,
  shareFolded,
  sharePreview,
  onExpandShare,
  onCopyText,
  onDownload,
}) => {
  const hasImage = Boolean(current?.imageUrl);
  const isLandscape = previewAspectRatio > 1;
  const canExpandShare = Boolean(current?.shareZh || current?.shareEn);

  return (
    <main className="flex-1 relative flex flex-col min-w-0 bg-[#e5e0d8] shadow-inner">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#4a4539 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>

      <header className="h-16 flex justify-between items-center px-6 md:px-8 border-b border-brand-900/5 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 opacity-60 text-xs font-display italic tracking-wider">
          <Quote className="transform rotate-180" size={14} />
          <span>
            {fallbackTitle} · {fallbackSubtitle}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 hover:bg-white/50 rounded-lg transition text-brand-800" title="全屏预览">
            <Maximize2 size={18} />
          </button>
          <button
            onClick={onCopyText}
            className="p-2 hover:bg-white/50 rounded-lg transition text-brand-800"
            title="复制文案"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-brand-200 text-sm font-medium hover:border-brand-400 transition text-brand-900"
          >
            <Download size={16} />
            <span>导出</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`relative transition-all duration-700 shadow-2xl bg-white p-3 rounded-sm ${
              isLandscape ? 'w-[80%] max-w-4xl' : 'h-[85%] max-h-[80vh]'
            }`}
            style={{ aspectRatio: previewAspectRatio }}
          >
            <div
              className={`w-full h-full relative overflow-hidden bg-stone-100 ${
                canExpandShare ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (canExpandShare) onExpandShare();
              }}
            >
              {hasImage ? (
                <img
                  src={normalizeImageUrl(current!.imageUrl)}
                  alt={pickTitle(current, fallbackTitle)}
                  className={`w-full h-full object-cover transition-transform duration-[2s] ${
                    isGenerating ? 'scale-105 blur-sm' : 'scale-100 blur-0'
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-stone-400">
                  尚未生成海报
                </div>
              )}

              {isGenerating && <DiaryThinkingOverlay steps={thinkingSteps} />}

              {isGenerating && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-accent/50 shadow-[0_0_20px_rgba(159,62,62,0.6)] animate-scan z-30"></div>
              )}

              {!isGenerating && (
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent text-white animate-slide-in">
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wide mb-1">
                    {pickTitle(current, fallbackTitle)}
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm font-light uppercase tracking-widest">
                    {pickSubtitle(current, fallbackSubtitle)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {shareFolded && (
            <button
              type="button"
              onClick={onExpandShare}
              className="w-[80%] max-w-xl rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-xs text-stone-500 hover:text-brand-900 shadow-sm transition"
            >
              分享文案已折叠 · 点击展开
              {sharePreview ? <span className="ml-2 text-stone-400 line-clamp-1">{sharePreview}</span> : null}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
