import React from 'react';
import type { TravelMode } from '@/features/atlas/atlas.utils';

type AtlasControlsProps = {
  autoLocate: boolean;
  onToggleAutoLocate: () => void;
  travelMode: TravelMode;
  onSetTravelMode: (mode: TravelMode) => void;
};

export const AtlasControls: React.FC<AtlasControlsProps> = ({
  autoLocate,
  onToggleAutoLocate,
  travelMode,
  onSetTravelMode,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-2 py-1 text-[10px] text-stone-600">
        <span>自动定位</span>
        <button
          onClick={onToggleAutoLocate}
          className={`px-2 py-0.5 rounded-full font-bold ${autoLocate ? 'bg-emerald-600 text-white' : 'bg-white text-stone-500'}`}
        >
          {autoLocate ? '开启' : '关闭'}
        </button>
      </div>
      <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-2 py-1 text-[10px] text-stone-600">
        <span>出行方式</span>
        {(['walking', 'driving', 'transit'] as TravelMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSetTravelMode(mode)}
            className={`px-2 py-0.5 rounded-full font-bold ${
              travelMode === mode ? 'bg-stamp text-white' : 'bg-white text-stone-500'
            }`}
          >
            {mode === 'walking' ? '步行' : mode === 'driving' ? '驾车' : '公交'}
          </button>
        ))}
      </div>
    </div>
  );
};
