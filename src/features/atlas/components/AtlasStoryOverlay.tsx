import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Sparkles,
  X,
  CheckCircle2,
  Film,
} from 'lucide-react';
import type { StoryArc, StoryScene } from '@/shared/types';

type AtlasStoryOverlayProps = {
  open: boolean;
  loading: boolean;
  error?: string | null;
  arc: StoryArc | null;
  currentScene: StoryScene | null;
  currentIndex: number;
  onClose: () => void;
  onSelectScene: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onRoute?: () => void;
  onCheckin: () => void;
  onRegenerate: () => void;
  onNavigateDiary?: () => void;
};

export const AtlasStoryOverlay: React.FC<AtlasStoryOverlayProps> = ({
  open,
  loading,
  error,
  arc,
  currentScene,
  currentIndex,
  onClose,
  onSelectScene,
  onPrev,
  onNext,
  onRoute,
  onCheckin,
  onRegenerate,
  onNavigateDiary,
}) => {
  if (!open) return null;

  const scenes = arc?.scenes ?? [];
  const total = scenes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-paper border border-stone-200 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-ink text-paper px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center">
              <Film size={16} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-stone-400">片场剧本</div>
              <div className="text-xl font-serif font-bold">{arc?.title ?? '生成中...'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="text-xs px-3 py-1.5 rounded-full border border-stone-700 text-stone-300 hover:text-white hover:border-stone-400 flex items-center gap-1"
            >
              <RefreshCw size={12} /> 重新生成
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-800">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-texture">
          {loading && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 flex items-center gap-3 text-stone-500">
              <Sparkles size={16} className="animate-pulse" />
              正在生成片场剧本，请稍候...
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {!loading && arc && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-stone-500">{arc.logline}</p>
                {arc.summary && <p className="text-xs text-stone-400">{arc.summary}</p>}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {scenes.map((scene, index) => {
                  const active = index === currentIndex;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => onSelectScene(index)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
                        active
                          ? 'bg-stamp text-white border-stamp'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {scene.title || `第${index + 1}幕`}
                    </button>
                  );
                })}
              </div>

              {currentScene && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
                        第 {currentIndex + 1} / {total} 幕
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-ink mt-1">
                        {currentScene.title}
                      </h3>
                      {currentScene.timeOfDay && (
                        <div className="text-xs text-stone-500 mt-1">
                          {currentScene.timeOfDay}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-stone-500">
                      {currentScene.durationMinutes ? `${currentScene.durationMinutes} min` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <MapPin size={14} />
                    <span className="font-serif font-bold text-ink">{currentScene.poi.name}</span>
                    {currentScene.poi.address && (
                      <span className="text-xs text-stone-400">{currentScene.poi.address}</span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                      <div className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
                        镜头建议
                      </div>
                      <p className="text-sm text-stone-600">{currentScene.shot}</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                      <div className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
                        旁白
                      </div>
                      <p className="text-sm text-stone-600">{currentScene.narration}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-amber-500 mb-1">
                      任务
                    </div>
                    <p className="text-sm text-amber-700">{currentScene.task}</p>
                  </div>

                  {currentScene.tip && (
                    <div className="text-xs text-stone-500 border-l-2 border-stone-300 pl-3">
                      {currentScene.tip}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={onPrev}
                      disabled={currentIndex <= 0}
                      className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-stone-500 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} className="inline mr-1" />
                      上一幕
                    </button>
                    <button
                      onClick={onNext}
                      disabled={currentIndex >= total - 1}
                      className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-stone-500 disabled:opacity-40"
                    >
                      下一幕
                      <ChevronRight size={14} className="inline ml-1" />
                    </button>
                    {onRoute && (
                      <button
                        onClick={onRoute}
                        className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-stone-500"
                      >
                        <MapPin size={14} className="inline mr-1" />
                        查看路线
                      </button>
                    )}
                    <button
                      onClick={onCheckin}
                      className="px-4 py-2 rounded-full bg-stamp text-white text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> 打卡本幕
                    </button>
                    {onNavigateDiary && (
                      <button
                        onClick={onNavigateDiary}
                        className="px-4 py-2 rounded-full bg-ink text-paper text-xs font-bold"
                      >
                        生成本幕海报
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
