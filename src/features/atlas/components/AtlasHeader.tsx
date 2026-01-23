import React from 'react';
import { CloudSun, List, Loader2, LocateFixed, Map as MapIcon, Search, Sparkles, X } from 'lucide-react';
import type { CitySuggestion, WeatherInfo } from '@/features/atlas/atlas.utils';

type AtlasHeaderProps = {
  headerCollapsed: boolean;
  onToggleHeader: () => void;
  mode: 'map' | 'list';
  onToggleMode: () => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  searchHistory: string[];
  onSelectHistory: (term: string) => void;
  onClearHistory: () => void;
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  cityInput: string;
  onCityInputChange: (value: string) => void;
  onApplyCity: (value?: string) => void;
  citySuggestions: CitySuggestion[];
  cityHistory: string[];
  cityOptions: string[];
  showCityPanel: boolean;
  onShowCityPanel: (value: boolean) => void;
  citySearchLoading: boolean;
  city: string;
  weather: WeatherInfo | null;
  locating: boolean;
  onLocate: () => void;
  accuracyMeters: number | null;
  onStartStory: () => void;
  storyLoading: boolean;
};

export const AtlasHeader: React.FC<AtlasHeaderProps> = ({
  headerCollapsed,
  onToggleHeader,
  mode,
  onToggleMode,
  keyword,
  onKeywordChange,
  onSearch,
  searchHistory,
  onSelectHistory,
  onClearHistory,
  categories,
  activeCategory,
  onSelectCategory,
  cityInput,
  onCityInputChange,
  onApplyCity,
  citySuggestions,
  cityHistory,
  cityOptions,
  showCityPanel,
  onShowCityPanel,
  citySearchLoading,
  city,
  weather,
  locating,
  onLocate,
  accuracyMeters,
  onStartStory,
  storyLoading,
}) => {
  return (
    <div
      className={`bg-white border-b border-stone-200 p-5 rounded-b-[2rem] shadow-paper transition-all duration-500 ease-in-out ${
        headerCollapsed ? 'pt-3 pb-3' : 'pt-10'
      }`}
    >
      <div
        className={`flex items-center justify-between transition-all duration-500 ease-in-out ${
          headerCollapsed ? 'mb-2' : 'mb-4'
        }`}
      >
        <div className="flex-1">
          <p
            className={`text-xs uppercase tracking-widest text-stone-400 font-bold transition-all duration-500 ease-in-out ${
              headerCollapsed ? 'text-[8px] opacity-0 h-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            探索模式
          </p>
          <h1
            className={`font-serif font-bold text-ink transition-all duration-500 ease-in-out ${
              headerCollapsed ? 'text-xl' : 'text-3xl'
            }`}
          >
            城市图鉴
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHeader}
            className="flex items-center gap-1 bg-stone-100 px-2 py-1.5 rounded-full text-[10px] font-bold text-stone-600 border border-stone-200 hover:bg-stone-200 transition-colors"
            title={headerCollapsed ? '展开搜索' : '收起搜索'}
          >
            {headerCollapsed ? (
              <>
                <Search size={12} />
                <span>搜索</span>
              </>
            ) : (
              <>
                <X size={12} />
                <span>收起</span>
              </>
            )}
          </button>
          <button
            onClick={onToggleMode}
            className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-full text-xs font-bold text-stone-600 border border-stone-200 hover:bg-stone-200 transition-colors"
          >
            {mode === 'map' ? <List size={14} /> : <MapIcon size={14} />}
            {mode === 'map' ? '列表' : '地图'}
          </button>
          <button
            onClick={onStartStory}
            className="flex items-center gap-2 bg-stamp text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-ink transition-colors"
          >
            {storyLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            片场剧本
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          headerCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-stone-100 border border-stone-200 rounded-full px-3 py-2 flex items-center gap-2">
              <Search size={16} className="text-stone-400" />
              <input
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch();
                }}
                placeholder="搜索地点、关键词、文化元素..."
                className="bg-transparent w-full text-sm outline-none text-ink"
              />
            </div>
            <button
              onClick={onSearch}
              className="bg-ink text-paper px-4 py-2 rounded-full text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              搜索
            </button>
          </div>

          {searchHistory.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-500">
              <span className="uppercase tracking-widest text-stone-400">历史</span>
              {searchHistory.slice(0, 6).map((item) => (
                <button
                  key={item}
                  onClick={() => onSelectHistory(item)}
                  className="px-2 py-1 rounded-full border border-stone-200 bg-white hover:border-stone-400"
                >
                  {item}
                </button>
              ))}
              <button onClick={onClearHistory} className="text-stone-400 hover:text-stone-600">
                清空
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  activeCategory === category
                    ? 'bg-stamp text-white border-stamp'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-3 py-1">
                  <input
                    value={cityInput}
                    onChange={(e) => onCityInputChange(e.target.value)}
                    onFocus={() => onShowCityPanel(true)}
                    onBlur={() => setTimeout(() => onShowCityPanel(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onApplyCity();
                    }}
                    placeholder="搜索城市"
                    className="bg-transparent text-xs w-24 outline-none"
                  />
                  <button
                    onClick={() => onApplyCity()}
                    className="text-[10px] font-bold text-stone-500 hover:text-stone-700"
                  >
                    切换
                  </button>
                </div>
                {showCityPanel && (citySuggestions.length > 0 || cityHistory.length > 0) && (
                  <div className="absolute left-0 top-9 z-30 w-56 bg-white border border-stone-200 rounded-xl shadow-lg p-2 text-[11px] text-stone-600 max-h-80 overflow-y-auto">
                    {citySearchLoading && (
                      <div className="flex items-center gap-2 px-2 py-1 text-stone-400">
                        <Loader2 size={12} className="animate-spin" /> 加载中...
                      </div>
                    )}
                    {citySuggestions.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-stone-400 font-bold">搜索结果</div>
                        {citySuggestions.map((item) => (
                          <button
                            key={`${item.name}-${item.district ?? ''}`}
                            onClick={() => onApplyCity(item.name)}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-50 flex items-center justify-between"
                          >
                            <span>{item.name}</span>
                            {item.district && <span className="text-stone-400 text-[10px]">{item.district}</span>}
                          </button>
                        ))}
                      </>
                    )}
                    {citySuggestions.length === 0 && cityHistory.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-stone-400 font-bold">最近访问</div>
                        {cityHistory.map((name) => (
                          <button
                            key={`history-${name}`}
                            onClick={() => onApplyCity(name)}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-50"
                          >
                            {name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
              <select
                value={city}
                onChange={(e) => onApplyCity(e.target.value)}
                className="bg-stone-100 border border-stone-200 rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-stone-200 transition-colors"
                title="快速切换城市"
              >
                {cityHistory.length > 0 && (
                  <optgroup label="━━ 最近访问 ━━">
                    {cityHistory.map((c) => (
                      <option key={`recent-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="━━ 热门城市 ━━">
                  {cityOptions.slice(0, 10).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="━━ 更多城市 ━━">
                  {cityOptions.slice(10).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              </select>
              {weather && (
                <div className="flex items-center gap-2 text-stone-600">
                  <CloudSun size={14} />
                  <span>
                    {weather.weather} {weather.temperature}
                  </span>
                </div>
              )}
            </div>
            <button onClick={onLocate} className="flex items-center gap-1 text-stone-500 hover:text-stone-700">
              {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
              定位
            </button>
          </div>
          {accuracyMeters && (
            <div className="mt-2 text-[10px] text-stone-400">定位精度约 {accuracyMeters} 米</div>
          )}
        </div>
      </div>
    </div>
  );
};
