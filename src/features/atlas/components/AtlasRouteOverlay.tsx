import React from 'react';
import { Navigation } from 'lucide-react';
import type { RouteInfo, TravelMode } from '@/features/atlas/atlas.utils';
import { formatDistance, formatDuration } from '@/features/atlas/atlas.utils';

type AtlasRouteOverlayProps = {
  routeInfo: RouteInfo | null;
  show: boolean;
  travelMode: TravelMode;
  onSetTravelMode: (mode: TravelMode) => void;
  onClose: () => void;
};

export const AtlasRouteOverlay: React.FC<AtlasRouteOverlayProps> = ({
  routeInfo,
  show,
  travelMode,
  onSetTravelMode,
  onClose,
}) => {
  if (!routeInfo || !show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-ink flex items-center gap-2">
          <Navigation size={14} /> 路线详情
        </div>
        <button onClick={onClose} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          关闭
        </button>
      </div>
      <p className="text-xs text-stone-500">
        距离 {formatDistance(routeInfo.distanceMeters)} · 约 {formatDuration(routeInfo.durationSeconds)}
      </p>
      <ul className="mt-3 max-h-40 overflow-auto space-y-1 text-xs text-stone-600">
        {routeInfo.steps.map((step, index) => (
          <li key={index}>- {step.instruction}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
        {(['walking', 'driving', 'transit'] as TravelMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSetTravelMode(mode)}
            className={`px-2 py-1 rounded-full font-bold border ${
              travelMode === mode ? 'bg-stamp text-white border-stamp' : 'bg-white text-stone-500 border-stone-200'
            }`}
          >
            {mode === 'walking' ? '步行' : mode === 'driving' ? '驾车' : '公交'}
          </button>
        ))}
      </div>
    </div>
  );
};
