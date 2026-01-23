import React from 'react';
import { X } from 'lucide-react';
import type { PoiItem } from '@/features/atlas/atlas.utils';

type AtlasNearbyModalProps = {
  open: boolean;
  pois: PoiItem[];
  onSelectPoi: (poi: PoiItem) => void;
  onClose: () => void;
};

export const AtlasNearbyModal: React.FC<AtlasNearbyModalProps> = ({ open, pois, onSelectPoi, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full md:max-w-4xl bg-paper rounded-t-2xl md:rounded-2xl border border-stone-200 shadow-2xl animate-slide-up max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-serif font-bold text-ink">附近更多</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-500"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {pois.length === 0 ? (
            <div className="text-sm text-stone-400">暂无推荐，请先搜索地点。</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pois.map((poi) => (
                <button
                  key={`modal-${poi.id}`}
                  onClick={() => {
                    onSelectPoi(poi);
                    onClose();
                  }}
                  className="text-left bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-sm font-serif font-bold text-ink line-clamp-2">{poi.name}</div>
                  <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {poi.address || poi.reason || '暂无地址'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(poi.tags && poi.tags.length ? poi.tags : []).slice(0, 3).map((tag) => (
                      <span
                        key={`${poi.id}-${tag}`}
                        className="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full border border-stone-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
