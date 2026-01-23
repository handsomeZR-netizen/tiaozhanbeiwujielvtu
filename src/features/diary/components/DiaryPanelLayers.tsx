import React from 'react';
import { ChevronDown, Tag } from 'lucide-react';
import { baseTags, promptLayerGroups, type PromptLayerKey } from '@/features/diary/diary.data';

type DiaryPanelLayersProps = {
  panelOpen: boolean;
  onToggle: () => void;
  keywords: string;
  onKeywordsChange: (value: string) => void;
  selectedLayers: Record<PromptLayerKey, string[]>;
  layerGroupOpen: Record<PromptLayerKey, boolean>;
  onToggleGroup: (key: PromptLayerKey) => void;
  onToggleLayer: (key: PromptLayerKey, value: string) => void;
  layerKeywords: string[];
  onAppendKeyword: (value: string) => void;
};

export const DiaryPanelLayers: React.FC<DiaryPanelLayersProps> = ({
  panelOpen,
  onToggle,
  keywords,
  onKeywordsChange,
  selectedLayers,
  layerGroupOpen,
  onToggleGroup,
  onToggleLayer,
  layerKeywords,
  onAppendKeyword,
}) => {
  return (
    <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5 lg:col-span-2">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2 text-stone-600">
          <Tag size={16} className="text-stamp" />
          <h2 className="font-serif text-lg text-ink">风格分层</h2>
        </div>
        <ChevronDown size={16} className={`text-stone-400 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
      </button>
      {panelOpen && (
        <div className="space-y-4 mt-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500">常用标签</span>
              <span className="text-[10px] text-stone-400">点击即可添加</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {baseTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onAppendKeyword(tag)}
                  className="px-3 py-1 rounded-full border border-stone-200 text-xs text-stone-500 hover:text-ink transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promptLayerGroups.map((group) => (
              <div key={group.key} className="border border-dashed border-stone-200 rounded-sm p-3">
                <button type="button" onClick={() => onToggleGroup(group.key)} className="w-full flex items-center justify-between text-left">
                  <span className="text-xs uppercase tracking-[0.2em] text-stone-500">{group.title}</span>
                  <ChevronDown
                    size={14}
                    className={`text-stone-400 transition-transform ${layerGroupOpen[group.key] ? 'rotate-180' : ''}`}
                  />
                </button>
                {layerGroupOpen[group.key] && (
                  <>
                    <div className="mt-2 text-[10px] text-stone-400">可多选</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isActive = selectedLayers[group.key].includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => onToggleLayer(group.key, option)}
                            className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                              isActive
                                ? 'border-ink bg-ink text-paper shadow-float'
                                : 'border-stone-200 text-stone-500 hover:text-ink'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-stone-500">自定义关键词</label>
            <input
              value={keywords}
              onChange={(event) => onKeywordsChange(event.target.value)}
              className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp/30"
              placeholder="古城, 石板路, 夜市"
            />
            <p className="text-[11px] text-stone-400 mt-2">
              当前标签：{layerKeywords.length ? layerKeywords.join('、') : '暂无'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
