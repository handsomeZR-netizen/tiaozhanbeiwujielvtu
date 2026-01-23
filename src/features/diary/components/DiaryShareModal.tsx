import React from 'react';
import { Copy, X } from 'lucide-react';

type DiaryShareModalProps = {
  open: boolean;
  closing: boolean;
  title?: string;
  subtitle?: string;
  shareZh?: string;
  shareEn?: string;
  onClose: () => void;
  onCopy: () => void;
};

export const DiaryShareModal: React.FC<DiaryShareModalProps> = ({
  open,
  closing,
  title,
  subtitle,
  shareZh,
  shareEn,
  onClose,
  onCopy,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-[92%] max-w-lg rounded-2xl bg-white shadow-2xl border border-brand-200 p-6 md:p-8 origin-bottom ${
          closing ? 'animate-share-collapse' : 'animate-share-pop'
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Share Caption</p>
            <h3 className="font-display text-2xl text-brand-900 mt-1">{title || '旅行海报'}</h3>
            {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand-200 p-2 text-stone-400 hover:text-brand-900 hover:border-brand-400 transition"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-stone-700 space-y-3 min-h-[120px]">
          {shareZh || shareEn ? (
            <>
              {shareZh ? (
                <p className="whitespace-pre-line">{shareZh}</p>
              ) : (
                <p className="text-stone-400">正在生成中文文案…</p>
              )}
              {shareEn ? (
                <p className="whitespace-pre-line text-stone-500">{shareEn}</p>
              ) : (
                <p className="text-stone-400">Generating English caption…</p>
              )}
            </>
          ) : (
            <p className="text-stone-400">暂无分享文案，请先生成海报。</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs text-stone-600 hover:text-brand-900"
          >
            <Copy size={14} />
            复制中英文
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-brand-900 text-white px-4 py-2 text-xs hover:bg-black"
          >
            收起
          </button>
        </div>
      </div>
    </div>
  );
};
