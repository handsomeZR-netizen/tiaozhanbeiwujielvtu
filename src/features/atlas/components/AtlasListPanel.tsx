import React from 'react';
import { Loader2 } from 'lucide-react';
import type { PoiItem } from '@/features/atlas/atlas.utils';
import { formatDistance } from '@/features/atlas/atlas.utils';

type AtlasListPanelProps = {
  loading: boolean;
  pois: PoiItem[];
  lastQuery: string;
  onSelectPoi: (poi: PoiItem) => void;
};

export const AtlasListPanel: React.FC<AtlasListPanelProps> = ({ loading, pois, lastQuery, onSelectPoi }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Loader2 size={14} className="animate-spin" /> 正在加载...
      </div>
    );
  }

  if (!loading && pois.length === 0) {
    return (
      <div className="text-sm text-stone-400">
        未找到与“{lastQuery || '当前搜索'}”相关的地点
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pois.map((poi) => (
        <button
          key={poi.id}
          onClick={() => onSelectPoi(poi)}
          className="w-full text-left bg-white border border-stone-200 rounded-xl p-4 shadow-paper"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-ink">{poi.name}</h3>
              <div className="text-xs text-stone-500 mt-1">{poi.address || poi.reason || '暂无地址'}</div>
            </div>
            <span className="text-xs text-stone-400">{poi.distance ? formatDistance(poi.distance) : ''}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(poi.tags && poi.tags.length ? poi.tags : []).slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};
