import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  Layers,
  MapPin,
  Sparkles,
  Wand2,
  Lightbulb,
} from 'lucide-react';
import {
  baseTags,
  platforms,
  promptLayerGroups,
  sizes,
  styles,
  templates,
  themes,
  posterExamples,
  type PromptLayerKey,
} from '@/features/diary/diary.data';
import { ratioPresets } from '@/features/diary/diary.ratios';
import type { PosterForm, PosterPolishResult } from '@/features/diary/diary.utils';

type DiaryConfigPanelProps = {
  form: PosterForm;
  onChange: (patch: Partial<PosterForm>) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  generateError: string;
  onPolish: () => void;
  polishLoading: boolean;
  polishError: string;
  polishResult: PosterPolishResult | null;
  onClearPolish: () => void;
  shareZh?: string | null;
  shareEn?: string | null;
  onCopyShare: () => void;
  selectedLayers: Record<PromptLayerKey, string[]>;
  layerGroupOpen: Record<PromptLayerKey, boolean>;
  onToggleGroup: (key: PromptLayerKey) => void;
  onToggleLayer: (key: PromptLayerKey, value: string) => void;
  onAppendKeyword: (value: string) => void;
  layerKeywords: string[];
  onApplyExample: (layers: Record<PromptLayerKey, string[]>) => void;
};

const ratioShapes: Record<string, string> = {
  '1:1': 'w-4 h-4',
  '3:4': 'w-3 h-4',
  '4:3': 'w-5 h-3',
  '9:16': 'w-2.5 h-5',
};

export const DiaryConfigPanel: React.FC<DiaryConfigPanelProps> = ({
  form,
  onChange,
  onGenerate,
  canGenerate,
  isGenerating,
  generateError,
  onPolish,
  polishLoading,
  polishError,
  polishResult,
  onClearPolish,
  shareZh,
  shareEn,
  onCopyShare,
  selectedLayers,
  layerGroupOpen,
  onToggleGroup,
  onToggleLayer,
  onAppendKeyword,
  layerKeywords,
  onApplyExample,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'style'>('basic');
  const [exampleMenuOpen, setExampleMenuOpen] = useState(false);
  const selectedRatio = useMemo(
    () => ratioPresets.find((item) => item.size === form.size) ?? ratioPresets[0],
    [form.size],
  );

  const handleApplyExample = (exampleId: string) => {
    const example = posterExamples.find((ex) => ex.id === exampleId);
    if (!example) return;
    
    onChange({
      city: example.city,
      theme: example.theme,
      style: example.style,
      platform: example.platform,
      prompt: example.prompt,
      keywords: example.keywords,
    });
    onApplyExample(example.layers);
    setExampleMenuOpen(false);
  };

  return (
    <aside className="w-full lg:w-[360px] h-auto lg:h-full bg-brand-50/70 border-r border-brand-200 flex flex-col backdrop-blur-sm">
      <div className="p-6 border-b border-brand-200 bg-white/80">
        <h1 className="font-display text-2xl text-brand-900">海报工坊</h1>
        <p className="text-sm text-stone-500 mt-1">定制你的旅行叙事海报。</p>
      </div>

      <div className="flex px-6 pt-4 gap-6 text-sm font-medium border-b border-brand-200 items-center">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'basic'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-stone-400 hover:text-stone-600'
          }`}
        >
          构图配置
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'style'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-stone-400 hover:text-stone-600'
          }`}
        >
          风格美学
        </button>
        <div className="ml-auto pb-3 relative">
          <button
            type="button"
            onClick={() => setExampleMenuOpen(!exampleMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-medium"
          >
            <Lightbulb size={14} />
            示例
          </button>
          {exampleMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setExampleMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-brand-200 py-2 z-20 max-h-96 overflow-y-auto custom-scrollbar">
                {posterExamples.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => handleApplyExample(example.id)}
                    className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-brand-900">{example.name}</div>
                    <div className="text-xs text-stone-500 mt-1">
                      {example.theme} · {example.style}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === 'basic' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">目的地</label>
              <div className="relative group">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-accent transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => onChange({ city: event.target.value })}
                  className="w-full bg-white border border-brand-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-stone-300"
                  placeholder="例如：杭州，西湖"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">主题</label>
              <select
                value={form.theme}
                onChange={(event) => onChange({ theme: event.target.value })}
                className="w-full bg-white border border-brand-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
              >
                {themes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">画面描述</label>
                <button
                  type="button"
                  disabled={polishLoading}
                  onClick={onPolish}
                  className="text-[10px] flex items-center gap-1 text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-md hover:bg-brand-accent/20 transition disabled:opacity-60"
                >
                  <Wand2 size={10} /> {polishLoading ? '润色中...' : '智能润色'}
                </button>
              </div>
              <textarea
                value={form.prompt}
                onChange={(event) => onChange({ prompt: event.target.value })}
                className="w-full h-32 bg-white border border-brand-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-stone-300 resize-none"
                placeholder="描述你想捕捉的场景、情绪与核心元素..."
              />
              {polishError && <p className="text-[11px] text-red-500">{polishError}</p>}
              {polishResult && (
                <div className="rounded-xl border border-brand-200 bg-white/80 p-3 space-y-2 text-xs text-stone-600">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>润色结果</span>
                    <button type="button" onClick={onClearPolish} className="text-brand-accent hover:text-brand-900">
                      清除
                    </button>
                  </div>
                  {polishResult.copyTitlePolished && (
                    <p className="line-clamp-2">
                      <span className="text-stone-400">标题：</span>
                      {polishResult.copyTitlePolished}
                    </p>
                  )}
                  {polishResult.copySubtitlePolished && (
                    <p className="line-clamp-2">
                      <span className="text-stone-400">副标题：</span>
                      {polishResult.copySubtitlePolished}
                    </p>
                  )}
                  {polishResult.promptPolished && (
                    <p className="line-clamp-3">
                      <span className="text-stone-400">描述：</span>
                      {polishResult.promptPolished}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">分享文案（中英）</label>
                <button
                  type="button"
                  onClick={onCopyShare}
                  className="text-[10px] text-brand-accent hover:text-brand-900"
                >
                  复制
                </button>
              </div>
              <div className="rounded-xl border border-brand-200 bg-white/80 p-3 text-xs text-stone-600 space-y-2 min-h-[86px]">
                {isGenerating ? (
                  <p className="text-stone-400 animate-pulse">正在生成分享文案...</p>
                ) : shareZh || shareEn ? (
                  <>
                    {shareZh && <p className="whitespace-pre-line">{shareZh}</p>}
                    {shareEn && <p className="whitespace-pre-line text-stone-500">{shareEn}</p>}
                  </>
                ) : (
                  <p className="text-stone-400">生成海报后自动出现。</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">画布比例</label>
              <div className="grid grid-cols-4 gap-2">
                {ratioPresets.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    disabled={ratio.disabled}
                    onClick={() => onChange({ size: ratio.size })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      selectedRatio.id === ratio.id
                        ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                        : 'border-brand-200 hover:border-brand-300 text-stone-400'
                    } ${ratio.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={ratio.disabled ? ratio.hint : ratio.size}
                  >
                    <div
                      className={`border-2 rounded-sm mb-1 ${
                        ratioShapes[ratio.id] ?? 'w-4 h-4'
                      } ${selectedRatio.id === ratio.id ? 'border-brand-accent' : 'border-stone-300'}`}
                    ></div>
                    <span className="text-[10px] font-medium">{ratio.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">平台</label>
                <select
                  value={form.platform}
                  onChange={(event) => onChange({ platform: event.target.value })}
                  className="w-full bg-white border border-brand-200 rounded-xl py-2 px-3 text-sm"
                >
                  {platforms.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">尺寸</label>
                <select
                  value={form.size}
                  onChange={(event) => onChange({ size: event.target.value })}
                  className="w-full bg-white border border-brand-200 rounded-xl py-2 px-3 text-sm"
                >
                  {sizes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">艺术风格</label>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onChange({ style })}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all relative overflow-hidden group ${
                      form.style === style
                        ? 'border-brand-accent bg-brand-accent text-white shadow-md'
                        : 'border-brand-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <span className="relative z-10 font-medium">{style}</span>
                    {form.style === style && (
                      <Sparkles className="absolute right-2 top-2 text-white/20" size={40} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">语言</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'zh', label: '中文' },
                  { id: 'en', label: '英文' },
                  { id: 'bilingual', label: '中英' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChange({ language: item.id as PosterForm['language'] })}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      form.language === item.id
                        ? 'border-brand-accent text-brand-accent bg-brand-accent/10'
                        : 'border-brand-200 text-stone-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">模板</label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onChange({ template: template.id })}
                    className={`rounded-xl border p-3 text-left ${
                      form.template === template.id
                        ? 'border-brand-accent bg-brand-accent/10'
                        : 'border-brand-200 bg-white'
                    }`}
                  >
                    <div className="h-2 w-8 rounded-full mb-2" style={{ backgroundColor: template.accent }} />
                    <p className="text-sm font-semibold text-brand-900">{template.name}</p>
                    <p className="text-[10px] text-stone-500 mt-1">{template.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-brand-200">
              <div className="flex items-center gap-2 text-brand-900">
                <Layers size={16} />
                <span className="text-sm font-semibold">关键词与图层</span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-stone-500">常用标签</span>
                  <span className="text-[10px] text-stone-400">点击即可添加</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {baseTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onAppendKeyword(tag)}
                      className="px-3 py-1 rounded-full border border-brand-200 text-xs text-stone-500 hover:text-brand-900"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {promptLayerGroups.map((group) => (
                  <div key={group.key} className="border border-dashed border-brand-200 rounded-xl p-3">
                    <button
                      type="button"
                      onClick={() => onToggleGroup(group.key)}
                      className="w-full flex items-center justify-between text-left"
                    >
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
                                type="button"
                                onClick={() => onToggleLayer(group.key, option)}
                                className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                                  isActive
                                    ? 'border-brand-900 bg-brand-900 text-white shadow-float'
                                    : 'border-brand-200 text-stone-500 hover:text-brand-900'
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
                  value={form.keywords}
                  onChange={(event) => onChange({ keywords: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                  placeholder="古城, 石板路, 夜市"
                />
                <p className="text-[11px] text-stone-400 mt-2">
                  当前标签：{layerKeywords.length ? layerKeywords.join('、') : '暂无'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-brand-200 bg-white">
        <button
          type="button"
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
          className="w-full bg-brand-900 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="group-hover:animate-pulse" />
              <span>生成海报</span>
            </>
          )}
        </button>
        {generateError && <p className="text-[11px] text-red-500 mt-2">{generateError}</p>}
      </div>
    </aside>
  );
};
