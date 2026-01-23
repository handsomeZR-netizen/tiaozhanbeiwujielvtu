import React from 'react';
import { Loader2, MapPin } from 'lucide-react';
import type { PoiItem } from '@/features/atlas/atlas.utils';

type AtlasMapPanelProps = {
  mapCollapsed: boolean;
  onToggleMapCollapsed: () => void;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  mapReady: boolean;
  mapError: string | null;
  loadingPois: boolean;
  showMapFallback: boolean;
  hasMapKey: boolean;
  pois: PoiItem[];
  selectedPoi: PoiItem | null;
  onSelectPoi: (poi: PoiItem) => void;
  getPosition: (poi: PoiItem) => React.CSSProperties;
  onOpenNearby: () => void;
};

export const AtlasMapPanel: React.FC<AtlasMapPanelProps> = ({
  mapCollapsed,
  onToggleMapCollapsed,
  mapContainerRef,
  mapReady,
  mapError,
  loadingPois,
  showMapFallback,
  hasMapKey,
  pois,
  selectedPoi,
  onSelectPoi,
  getPosition,
  onOpenNearby,
}) => {
  return (
    <div className="space-y-4">
      <div className="md:grid md:grid-cols-[2fr,1fr] gap-4 items-start">
        <div className="space-y-3">
          <div
            className={`relative rounded-2xl border border-stone-200 overflow-hidden shadow-paper transition-all duration-500 ${
              mapCollapsed ? 'h-[200px]' : 'h-[300px]'
            }`}
          >
            {!showMapFallback && (
              <div className="absolute inset-0 bg-stone-100">
                <div ref={mapContainerRef} className="absolute inset-0" />
                {!mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-500 bg-white/70">
                    <Loader2 className="animate-spin mr-2" size={16} /> 地图加载中...
                  </div>
                )}
              </div>
            )}

            {showMapFallback && (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),rgba(0,0,0,0))]" />
                <div className="absolute top-3 left-3 text-[10px] bg-white/80 px-2 py-1 rounded-full border border-stone-200">
                  示意地图{hasMapKey ? '' : '（未配置密钥）'}
                </div>

                <div
                  className="absolute w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
                  style={{ left: '50%', top: '55%' }}
                  title="当前位置"
                />

                {pois.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => onSelectPoi(poi)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 ${
                      selectedPoi?.id === poi.id ? 'text-stamp' : 'text-ink'
                    }`}
                    style={getPosition(poi)}
                  >
                    <div
                      className={`p-2 rounded-full shadow-md border ${
                        selectedPoi?.id === poi.id ? 'bg-stamp text-white border-stamp' : 'bg-white border-stone-200'
                      }`}
                    >
                      <MapPin size={16} />
                    </div>
                    <span className="text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded-full border border-stone-200">
                      {poi.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {mapError && (
              <div className="absolute bottom-3 left-3 text-[10px] bg-white/90 px-2 py-1 rounded-full border border-stone-200">
                {mapError}
              </div>
            )}

            {loadingPois && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <Loader2 className="animate-spin text-stone-500" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <span>{mapCollapsed ? '地图已折叠' : '地图已展开'}</span>
            <button
              onClick={onToggleMapCollapsed}
              className="px-2 py-1 rounded-full border border-stone-200 bg-white hover:border-stone-300"
            >
              {mapCollapsed ? '展开' : '收起'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-paper">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">附近推荐</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full border border-stone-200">
                {pois.length} 个
              </span>
              {pois.length > 4 && (
                <button onClick={onOpenNearby} className="text-[10px] text-stone-500 hover:text-stamp">
                  更多
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pois.slice(0, 4).map((poi) => (
              <button
                key={`card-${poi.id}`}
                onClick={() => onSelectPoi(poi)}
                className={`text-left bg-stone-50 border rounded-xl p-3 transition-all duration-300 min-h-[120px] ${
                  selectedPoi?.id === poi.id
                    ? 'border-stamp shadow-float -translate-y-1'
                    : 'border-stone-200 hover:border-stone-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="text-sm font-serif font-bold text-ink line-clamp-2">{poi.name}</div>
                <div className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                  {poi.address || poi.reason || '暂无地址'}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(poi.tags && poi.tags.length ? poi.tags : []).slice(0, 2).map((tag) => (
                    <span
                      key={`${poi.id}-${tag}`}
                      className="text-[9px] bg-white text-stone-500 px-2 py-0.5 rounded-full border border-stone-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
            {pois.length === 0 && (
              <div className="col-span-2 text-xs text-stone-400">暂无推荐，请先搜索地点。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
