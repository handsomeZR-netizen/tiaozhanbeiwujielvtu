import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Brush, Download, Globe, Languages, MapPin, Sparkles, Tag, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

type PosterRecord = {
  id: string;
  city?: string | null;
  theme?: string | null;
  style?: string | null;
  language?: string | null;
  platform?: string | null;
  size?: string | null;
  prompt: string;
  imageUrl: string;
  copyTitle?: string | null;
  copySubtitle?: string | null;
  tags?: string[];
  createdAt: string;
};

type PosterForm = {
  city: string;
  theme: string;
  style: string;
  language: 'zh' | 'en' | 'bilingual';
  platform: string;
  size: string;
  keywords: string;
  template: string;
};

const templates = [
  { id: 'classic', name: '经典旅拍', desc: '留白 + 主视觉', accent: '#D4A373' },
  { id: 'modern', name: '现代城市', desc: '极简 + 霓虹', accent: '#0F766E' },
  { id: 'heritage', name: '文化国潮', desc: '纹样 + 书法感', accent: '#9A3412' },
  { id: 'film', name: '胶片回忆', desc: '暖调 + 颗粒感', accent: '#6B7280' },
];

const styles = ['国潮', '极简', '现代', '胶片', '水墨', '未来感'];
const themes = ['城市夜景', '文化地标', '山水漫游', '美食之旅', '古城故事'];
const platforms = ['Instagram', '小红书', '抖音', 'TikTok', '海报打印'];
const sizes = ['1024x1024', '1024x1536', '1536x1024'];

const normalizeImageUrl = (value: string) =>
  value.startsWith('http') ? value : `data:image/png;base64,${value}`;

export const Diary: React.FC = () => {
  const [form, setForm] = useState<PosterForm>({
    city: '合肥',
    theme: themes[0],
    style: styles[0],
    language: 'bilingual',
    platform: platforms[0],
    size: sizes[0],
    keywords: '徽派建筑, 夜色, 老街',
    template: templates[0].id,
  });
  const [history, setHistory] = useState<PosterRecord[]>([]);
  const [current, setCurrent] = useState<PosterRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/posters?limit=12`);
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error ?? '加载失败');
      }
      setHistory(data.data ?? []);
      if (!current && data.data?.length) {
        setCurrent(data.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }, [current]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const canGenerate = useMemo(() => form.city.trim().length > 0, [form.city]);

  const handleGenerate = async () => {
    if (!canGenerate || loading) return;
    setError('');
    setLoading(true);
    try {
      const payload = {
        city: form.city.trim(),
        theme: form.theme,
        style: form.style,
        language: form.language,
        platform: form.platform,
        size: form.size,
        keywords: form.keywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .concat([form.template]),
      };
      const res = await fetch(`${API_BASE}/posters/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error ?? '生成失败');
      }
      setCurrent(data.data);
      await fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/posters/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error ?? '删除失败');
      }
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (current?.id === id) {
        setCurrent(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleDownload = (record?: PosterRecord | null) => {
    if (!record?.imageUrl) return;
    const link = document.createElement('a');
    link.href = normalizeImageUrl(record.imageUrl);
    link.download = `${record.city ?? 'poster'}-${record.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyText = async (record?: PosterRecord | null) => {
    if (!record) return;
    const text = `${record.copyTitle ?? ''}\n${record.copySubtitle ?? ''}`.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-paper p-5 pb-32 bg-texture w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full">
        <header className="pt-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-50 text-stamp flex items-center justify-center shadow-float">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-ink">海报生成</h1>
              <p className="text-xs text-stone-500 tracking-[0.2em] uppercase">Poster Studio</p>
            </div>
          </div>
          <p className="text-sm text-stone-500 leading-6">
            一键生成适合多平台传播的中国旅游海报，为挑战杯展示准备高辨识度视觉。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] w-full">
          <div className="space-y-6">
            <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5">
              <div className="flex items-center gap-2 mb-4 text-stone-600">
                <MapPin size={16} className="text-stamp" />
                <h2 className="font-serif text-lg text-ink">城市与主题</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-500">城市</label>
                  <input
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp/30"
                    placeholder="例如：合肥"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-500">主题</label>
                  <select
                    value={form.theme}
                    onChange={(event) => setForm((prev) => ({ ...prev, theme: event.target.value }))}
                    className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
                  >
                    {themes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['夜景', '古城', '美食', '人文', '自然'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        keywords: prev.keywords ? `${prev.keywords}, ${tag}` : tag,
                      }))
                    }
                    className="px-3 py-1 rounded-full border border-stone-200 text-xs text-stone-500 hover:text-ink"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5">
              <div className="flex items-center gap-2 mb-4 text-stone-600">
                <Brush size={16} className="text-stamp" />
                <h2 className="font-serif text-lg text-ink">风格与语言</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-500">视觉风格</label>
                  <select
                    value={form.style}
                    onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
                    className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
                  >
                    {styles.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-500">语言</label>
                  <div className="mt-2 flex gap-2">
                    {[
                      { id: 'zh', label: '中文' },
                      { id: 'en', label: 'English' },
                      { id: 'bilingual', label: '双语' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setForm((prev) => ({ ...prev, language: item.id as PosterForm['language'] }))}
                        className={`flex-1 rounded-sm border px-3 py-2 text-xs ${
                          form.language === item.id
                            ? 'border-stamp text-stamp bg-red-50'
                            : 'border-stone-200 text-stone-500'
                        }`}
                      >
                        <Languages size={12} className="inline mr-1" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs uppercase tracking-[0.2em] text-stone-500">关键词（逗号分隔）</label>
                <input
                  value={form.keywords}
                  onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
                  className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp/30"
                  placeholder="徽派建筑, 夜色, 人文"
                />
              </div>
            </div>

            <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5">
              <div className="flex items-center gap-2 mb-4 text-stone-600">
                <Globe size={16} className="text-stamp" />
                <h2 className="font-serif text-lg text-ink">平台与画布</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-500">发布平台</label>
                  <select
                    value={form.platform}
                    onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))}
                    className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
                  >
                    {platforms.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-stone-500">画布尺寸</label>
                  <select
                    value={form.size}
                    onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
                    className="mt-2 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm"
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

            <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-5">
              <div className="flex items-center gap-2 mb-4 text-stone-600">
                <Tag size={16} className="text-stamp" />
                <h2 className="font-serif text-lg text-ink">模板布局</h2>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent md:hidden" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent md:hidden" />
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-4 md:gap-3 md:overflow-visible">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setForm((prev) => ({ ...prev, template: template.id }))}
                      className={`min-w-[140px] md:min-w-0 rounded-sm border p-3 text-left snap-center ${
                        form.template === template.id ? 'border-stamp bg-red-50/60' : 'border-stone-200'
                      }`}
                    >
                      <div className="h-2 w-8 rounded-full mb-2" style={{ backgroundColor: template.accent }} />
                      <p className="text-sm font-semibold text-ink">{template.name}</p>
                      <p className="text-xs text-stone-500 mt-1">{template.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="flex-1 rounded-sm bg-ink text-paper py-3 text-sm font-semibold shadow-float disabled:opacity-50"
              >
                {loading ? '正在生成海报...' : '一键生成海报'}
              </button>
              <button
                onClick={() => fetchHistory()}
                className="rounded-sm border border-stone-200 px-4 py-3 text-sm text-stone-500 hover:text-ink"
              >
                刷新
              </button>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg text-ink">预览</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(current)}
                    className="text-xs text-stone-500 hover:text-ink"
                  >
                    复制文案
                  </button>
                  <button
                    onClick={() => handleDownload(current)}
                    className="text-xs text-stone-500 hover:text-ink flex items-center gap-1"
                  >
                    <Download size={12} /> 下载
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-sm border border-stone-100 bg-stone-50 aspect-[2/3] shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)]">
                {current?.imageUrl ? (
                  <>
                    <img
                      src={normalizeImageUrl(current.imageUrl)}
                      alt={current.copyTitle ?? 'poster'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-serif text-lg">{current.copyTitle}</h4>
                      <p className="text-xs opacity-80 mt-1">{current.copySubtitle}</p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-stone-400">
                    生成后的海报会在这里展示
                  </div>
                )}
              </div>
              {current?.prompt && (
                <p className="text-[11px] text-stone-400 mt-3 line-clamp-3">
                  Prompt: {current.prompt}
                </p>
              )}
            </div>

            <div className="bg-white rounded-sm border border-stone-200 shadow-paper p-4">
              <h3 className="font-serif text-lg text-ink mb-3">历史记录</h3>
              {history.length === 0 ? (
                <div className="text-xs text-stone-500">暂无海报，先生成一张吧。</div>
              ) : (
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent lg:hidden" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent lg:hidden" />
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth lg:block lg:space-y-3 lg:overflow-visible">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrent(item)}
                        className="min-w-[240px] lg:min-w-0 w-full text-left border border-stone-100 rounded-sm p-2 hover:bg-stone-50 snap-center shadow-[0_12px_24px_-18px_rgba(0,0,0,0.6)]"
                      >
                        <div className="flex gap-3 items-center">
                          <div className="w-16 h-16 rounded-sm overflow-hidden bg-stone-100">
                            {item.imageUrl && (
                              <img
                                src={normalizeImageUrl(item.imageUrl)}
                                alt={item.copyTitle ?? 'poster'}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-ink line-clamp-1">
                              {item.copyTitle ?? item.city ?? '海报'}
                            </p>
                            <p className="text-xs text-stone-500 line-clamp-1">
                              {item.copySubtitle ?? item.theme ?? '主题海报'}
                            </p>
                            <p className="text-[10px] text-stone-400 mt-1">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="text-stone-400 hover:text-red-500"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};
