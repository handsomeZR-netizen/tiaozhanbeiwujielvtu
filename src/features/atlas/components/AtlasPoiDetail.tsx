import React from 'react';
import { Bookmark, CheckCircle2, Loader2, MapPin, Navigation, Route, Share2, Sparkles } from 'lucide-react';
import type { PoiItem, RouteInfo } from '@/features/atlas/atlas.utils';
import { formatDistance, formatDuration } from '@/features/atlas/atlas.utils';

type AtlasPoiDetailProps = {
  poi: PoiItem;
  routeInfo: RouteInfo | null;
  showRouteDetail: boolean;
  onToggleRouteDetail: () => void;
  loadingAi: boolean;
  aiContext: string | null;
  aiTags: string[];
  isFavorite: boolean;
  hasCheckin: boolean;
  onLoadRoute: () => void;
  onLoadAi: () => void;
  onToggleFavorite: () => void;
  onAddCheckin: () => void;
  onShare: () => void;
};

export const AtlasPoiDetail: React.FC<AtlasPoiDetailProps> = ({
  poi,
  routeInfo,
  showRouteDetail,
  onToggleRouteDetail,
  loadingAi,
  aiContext,
  aiTags,
  isFavorite,
  hasCheckin,
  onLoadRoute,
  onLoadAi,
  onToggleFavorite,
  onAddCheckin,
  onShare,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-float relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full" />
      <div className="relative">
        <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
          <MapPin size={18} className="text-stamp" /> {poi.name}
        </h2>
        <p className="text-xs text-stone-500 mt-2">{poi.address || poi.reason || '暂无地址'}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {(poi.tags && poi.tags.length ? poi.tags : ['#暂无标签']).slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={onLoadRoute} className="flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-full text-xs font-bold">
            <Route size={14} /> 路线规划
          </button>
          <button onClick={onLoadAi} className="flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-full text-xs font-bold">
            <Sparkles size={14} /> 文化解读
          </button>
          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
              isFavorite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-stone-600 border-stone-200'
            }`}
          >
            <Bookmark size={14} /> {isFavorite ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={onAddCheckin}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
              hasCheckin ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-stone-600 border-stone-200'
            }`}
          >
            <CheckCircle2 size={14} /> {hasCheckin ? '已打卡' : '打卡'}
          </button>
          <button onClick={onShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            <Share2 size={14} /> 分享
          </button>
        </div>

        {routeInfo && (
          <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <Navigation size={14} /> 路线详情
              </div>
              <button onClick={onToggleRouteDetail} className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                {showRouteDetail ? '收起' : '展开'}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              距离 {formatDistance(routeInfo.distanceMeters)} · 约 {formatDuration(routeInfo.durationSeconds)}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-stone-600 max-h-32 overflow-auto">
              {(showRouteDetail ? routeInfo.steps : routeInfo.steps.slice(0, 3)).map((step, index) => (
                <li key={index}>- {step.instruction}</li>
              ))}
            </ul>
          </div>
        )}

        {(loadingAi || aiContext) && (
          <div className="mt-4 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
              <Sparkles size={14} /> AI 解读
            </div>
            {loadingAi ? (
              <div className="mt-2 text-xs text-blue-700 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> 正在生成解读...
              </div>
            ) : (
              <p className="mt-2 text-xs text-blue-800 leading-relaxed">{aiContext}</p>
            )}

            {aiTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {aiTags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[10px] bg-white text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
