import React, { useRef, useState, useEffect } from 'react';
import { Upload, Sparkles, Share2, AlertTriangle, X, Camera, BookOpen, Copy, CheckCircle2, History, Image as ImageIcon } from 'lucide-react';
import { AgentFlow } from '@/shared/components/AgentFlow';
import { CultureModal } from '@/shared/components/CultureModal';
import { DEMO_CASES } from './demo-cases';
import { apiRequest } from '@/shared/lib/api';
import { readLocal, writeLocal } from '@/shared/lib/storage';
import { STUDIO_HISTORY_KEY } from '@/shared/lib/storageKeys';
const MAX_IMAGE_MB = 10;
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.85;
const PREFERENCE_OPTIONS = ['建筑与街巷', '民俗与节庆', '生活方式', '传统工艺'];

type HistoryItem = {
  id: string;
  image: string;
  result: CultureResult;
  timestamp: number;
};

type CultureInsight = {
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  detailedContent: string;
};

type CultureResult = {
  elements: string[];
  insights: CultureInsight[];
  tips: string[];
  share: { zh: string; en: string };
};

// 打字机效果Hook
const useTypewriter = (text: string, speed: number = 30) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    setIsTyping(true);
    setDisplayText('');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isTyping };
};

const DEFAULT_RESULT: CultureResult = {
  elements: [],
  insights: [],
  tips: [],
  share: { zh: '', en: '' },
};

const requestJson = async <T,>(path: string, init?: RequestInit) => apiRequest<T>(path, init);

const normalizeResult = (input: any): CultureResult => {
  if (!input || typeof input !== 'object') return DEFAULT_RESULT;
  const elements = Array.isArray(input.elements) ? input.elements.filter(Boolean) : [];
  const tips = Array.isArray(input.tips) ? input.tips.filter(Boolean) : [];
  const rawInsights = Array.isArray(input.insights) ? input.insights : [];
  const insights = rawInsights.map((item: any) => {
    if (typeof item === 'string') {
      return { title: item, subtitle: '', tags: [], description: item, detailedContent: item };
    }
    return {
      title: item?.title ?? '文化意象',
      subtitle: item?.subtitle ?? '',
      tags: Array.isArray(item?.tags) ? item.tags : [],
      description: item?.description ?? '',
      detailedContent: item?.detailedContent ?? item?.culture ?? item?.why ?? '',
    };
  });
  const share = input.share ?? {};
  return {
    elements,
    insights,
    tips,
    share: {
      zh: share.zh ?? '',
      en: share.en ?? '',
    },
  };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });

const compressImage = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const maxSide = Math.max(img.width, img.height);
  const scale = maxSide > MAX_DIMENSION ? MAX_DIMENSION / maxSide : 1;
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
};

export const StudioPage: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(false);
  const [resultData, setResultData] = useState<CultureResult>(DEFAULT_RESULT);
  const [showCultureModal, setShowCultureModal] = useState(false);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'zh' | 'en' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDemoCases, setShowDemoCases] = useState(false);

  const flowDoneRef = useRef(false);
  const apiDoneRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  // 加载历史记录（优先服务端，失败时回退本地）
  useEffect(() => {
    const load = async () => {
      try {
        const data = await requestJson<HistoryItem[]>('/studio/history?limit=20');
        if (Array.isArray(data) && data.length) {
          setHistory(data);
          return;
        }
      } catch {
        // ignore
      }
      const saved = readLocal<HistoryItem[]>(STUDIO_HISTORY_KEY, []);
      if (saved.length) {
        setHistory(saved);
      }
    };

    load();
  }, []);

  const pushHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 20);
      writeLocal(STUDIO_HISTORY_KEY, updated);
      return updated;
    });
  };

  // 保存历史记录（优先服务端）
  const saveToHistory = async (image: string, result: CultureResult) => {
    const fallback: HistoryItem = {
      id: Date.now().toString(),
      image,
      result,
      timestamp: Date.now(),
    };
    try {
      const data = await requestJson<HistoryItem>('/studio/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, result }),
      });
      if (data) {
        pushHistory(data);
        return;
      }
    } catch {
      // ignore
    }
    pushHistory(fallback);
  };

  // 从历史记录加载
  const loadFromHistory = (item: HistoryItem) => {
    setImage(item.image);
    setUploadImage(item.image);
    setResultData(item.result);
    setResult(true);
    setProcessing(false);
    setShowHistory(false);
  };

  // 从案例加载
  const loadDemoCase = (demo: typeof DEMO_CASES[0]) => {
    setImage(demo.thumbnail);
    setUploadImage(demo.thumbnail);
    setProcessing(false);
    setResult(false);
    setResultData(DEFAULT_RESULT); // 清除之前的识别结果
    setError(null); // 清除错误信息
    setShowDemoCases(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('请上传图片格式文件。');
        return;
      }
      const fileSizeMb = file.size / 1024 / 1024;
      if (fileSizeMb > MAX_IMAGE_MB) {
        setError(`图片过大，请上传不超过 ${MAX_IMAGE_MB}MB 的图片。`);
        return;
      }
      setPreparing(true);
      try {
        const compressed = await compressImage(file);
        setImage(compressed);
        setUploadImage(compressed);
        setProcessing(false);
        setResult(false);
        setError(null);
      } catch (err) {
        try {
          const fallback = await readFileAsDataUrl(file);
          setImage(fallback);
          setUploadImage(fallback);
          setProcessing(false);
          setResult(false);
          setError(null);
        } catch {
          setError('图片处理失败，请重试。');
        }
      } finally {
        setPreparing(false);
      }
    }
  };

  const resetImage = () => {
    setImage(null);
    setUploadImage(null);
    setProcessing(false);
    setResult(false);
    setError(null);
  };

  const togglePreference = (item: string) => {
    setPreferences((prev) => (prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]));
  };

  const finalizeIfReady = () => {
    if (flowDoneRef.current && apiDoneRef.current) {
      setProcessing(false);
      setResult(true);
      // 保存到历史记录
      if (uploadImage && resultData.elements.length > 0) {
        saveToHistory(uploadImage, resultData);
      }
    }
  };

  const processImage = async () => {
    if (!uploadImage) {
      setError('请先上传或拍摄一张照片。');
      return;
    }
    setResult(false);
    setProcessing(true);
    setError(null);
    flowDoneRef.current = false;
    apiDoneRef.current = false;

    try {
      const response = await requestJson<{ result?: unknown }>('/ai/culture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadImage, preferences }),
      });
      const payload = response?.result ?? response;
      const normalized = normalizeResult(payload);
      setResultData(normalized);
      setActiveInsightIndex(0);
      apiDoneRef.current = true;
      finalizeIfReady();
    } catch (err: any) {
      apiDoneRef.current = true;
      setProcessing(false);
      setResult(false);
      setError(err?.message ?? '识别失败，请稍后重试。');
    }
  };

  const handleCopy = (text: string, type: 'zh' | 'en') => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      const message = type === 'zh' ? '已复制中文文案' : '已复制英文文案';
      setToast(message);
      toastTimerRef.current = window.setTimeout(() => setToast(null), 2000);
    });
  };

  const activeInsight = resultData.insights[activeInsightIndex];
  const hasElements = resultData.elements.length > 0;
  const hasInsights = resultData.insights.length > 0;
  const hasTips = resultData.tips.length > 0;
  const hasShare = Boolean(resultData.share.zh || resultData.share.en);

  return (
    <div className="min-h-full bg-paper p-5 md:p-8 pb-8 bg-texture">
      <div className="flex items-center justify-between mb-8 pt-8 md:pt-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-1">灵感工坊</h1>
          <p className="text-xs text-stone-500 tracking-[0.2em] uppercase">文化洞察</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDemoCases(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-stone-300 rounded-sm hover:bg-stone-50 transition-colors"
            title="查看案例"
          >
            <ImageIcon size={16} />
            <span className="hidden md:inline">案例</span>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-stone-300 rounded-sm hover:bg-stone-50 transition-colors"
            title="查看历史"
          >
            <History size={16} />
            <span className="hidden md:inline">历史</span>
            {history.length > 0 && (
              <span className="bg-stamp text-white text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-4 space-y-6">
          <div
            className={`border-2 border-dashed border-stone-300 rounded-sm p-6 flex flex-col items-center justify-center bg-white/50 transition-all hover:bg-white hover:border-stone-400 hover:shadow-sm ${
              image ? 'h-72' : 'h-auto min-h-[14rem]'
            }`}
          >
            {image ? (
              <div className="relative w-full h-full group">
                <img src={image} className="w-full h-full object-contain shadow-sm" alt="上传预览" />
                <button
                  onClick={resetImage}
                  className="absolute -top-3 -right-3 bg-ink text-white p-1.5 rounded-full shadow-md hover:bg-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 w-full">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto transition-colors">
                  <Upload size={20} className="text-stone-400" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-stone-700 font-serif font-bold text-base">上传或拍摄照片</span>
                  <p className="text-xs text-stone-400 mt-1">支持 JPG / PNG，建议清晰正面图</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label className="cursor-pointer w-full bg-ink text-paper py-2.5 rounded-sm text-sm font-bold font-serif flex items-center justify-center gap-2 hover:bg-black transition-colors">
                    <Upload size={16} /> 上传照片
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                  </label>
                  <label className="cursor-pointer w-full border border-stone-200 text-stone-600 py-2.5 rounded-sm text-sm font-bold font-serif flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors">
                    <Camera size={16} /> 拍摄照片
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleUpload} />
                  </label>
                </div>
                {preparing && <p className="text-[11px] text-stone-400">正在处理图片...</p>}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-bold text-ink">识别偏好</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">可选</span>
              </div>
              {preferences.length > 0 && (
                <button 
                  onClick={() => setPreferences([])} 
                  className="text-[11px] text-stone-400 hover:text-stamp transition-colors"
                >
                  清空 ({preferences.length})
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PREFERENCE_OPTIONS.map((item) => {
                const isActive = preferences.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => togglePreference(item)}
                    className={`group relative px-4 py-3 rounded-sm text-sm font-serif transition-all ${
                      isActive 
                        ? 'bg-ink text-paper shadow-md scale-[1.02]' 
                        : 'bg-white/80 text-stone-600 border border-stone-200 hover:border-stamp hover:shadow-sm'
                    }`}
                  >
                    <span className="relative z-10">{item}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-ink to-stamp opacity-90 rounded-sm"></div>
                    )}
                    <span className={`absolute inset-0 flex items-center justify-center text-lg transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'
                    }`}>
                      {isActive ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              选择你感兴趣的文化类型，AI 将重点识别相关元素
            </p>
          </div>

          {image && !processing && (
            <button
              onClick={processImage}
              disabled={preparing}
              className={`w-full bg-ink text-paper py-4 rounded-sm font-serif font-bold text-lg shadow-float flex justify-center items-center gap-2 transition-colors active:scale-[0.98] ${
                preparing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-black'
              }`}
            >
              <Sparkles size={18} /> {result ? '重新识别' : '识别文化意象'}
            </button>
          )}
        </div>

        <div className="md:col-span-8">
          <div className="md:sticky md:top-4 space-y-6">
            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded-sm p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">识别未开始</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-xs text-red-600 hover:text-red-800">
                  我知道了
                </button>
              </div>
            )}

            {!result && !processing && (
              <div className="h-[500px] md:h-[calc(100vh-200px)] border-2 border-dashed border-stone-200 rounded-sm flex flex-col items-center justify-center text-stone-300 bg-white/30">
                <Camera size={64} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-lg font-serif text-stone-400">识别预览区</p>
                <p className="text-xs text-stone-400 mt-2">
                  {image ? '点击左侧按钮开始识别' : '上传或拍摄照片后开始识别'}
                </p>
              </div>
            )}

            <AgentFlow
              isRunning={processing}
              onComplete={() => {
                flowDoneRef.current = true;
                finalizeIfReady();
              }}
            />

            {result && (
              <div className="animate-slide-up">
                {/* 改进的识别结果展示 - 左图右文布局 */}
                <div className="bg-white rounded-sm shadow-float border border-stone-100 overflow-hidden">
                  {/* Header */}
                  <div className="p-5 md:p-6 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
                          <Sparkles size={18} className="text-stamp" />
                          AI 文化解读
                        </h3>
                        <p className="text-xs text-stone-500 mt-1">
                          识别到 {resultData.elements.length} 个文化元素 · {resultData.insights.length} 个深度解读
                        </p>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!hasElements && (
                    <div className="p-6 bg-amber-50 border-b border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-700">未识别到明显文化元素</p>
                          <p className="text-xs text-amber-600 mt-1">可以尝试更清晰的照片，或选择更聚焦的拍摄对象。</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasElements && (
                    <>
                      {/* 主要内容区 - 左图右文 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 md:p-6">
                        {/* 左侧：图片预览 */}
                        <div className="space-y-4">
                          <div className="relative group">
                            <img
                              src={image ?? ''}
                              className="w-full h-64 md:h-80 object-cover rounded-sm shadow-md border border-stone-200"
                              alt="识别图片"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"></div>
                          </div>
                          
                          {/* 识别元素标签 */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">识别元素</div>
                            <div className="flex flex-wrap gap-2">
                              {resultData.elements.map((tag, index) => (
                                <span 
                                  key={tag} 
                                  className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-ink to-stamp text-paper border border-ink/20 shadow-sm animate-fade-in"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 右侧：文化解读 */}
                        <div className="space-y-4">
                          <TypewriterSection 
                            title="文化意象解读"
                            icon={<BookOpen size={16} className="text-stamp" />}
                          >
                            {hasInsights ? (
                              <div className="space-y-3">
                                {resultData.insights.map((item, index) => (
                                  <InsightCard
                                    key={`${item.title}-${index}`}
                                    insight={item}
                                    index={index}
                                    onClick={() => {
                                      setActiveInsightIndex(index);
                                      setShowCultureModal(true);
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-stone-400">暂无文化解读内容。</p>
                            )}
                          </TypewriterSection>

                          <TypewriterSection 
                            title="旅行友好提示"
                            icon={<AlertTriangle size={16} className="text-stamp" />}
                          >
                            {hasTips ? (
                              <ul className="space-y-2">
                                {resultData.tips.map((tip, index) => (
                                  <li 
                                    key={tip} 
                                    className="flex gap-2 text-xs text-stone-600 animate-fade-in"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                  >
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-stamp flex-shrink-0"></span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-stone-400">暂无提示内容。</p>
                            )}
                          </TypewriterSection>
                        </div>
                      </div>

                      {/* 分享卡片 */}
                      <div className="p-5 md:p-6 bg-gradient-to-br from-ink to-stamp text-paper border-t border-stone-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Share2 size={16} />
                          <span className="text-sm font-bold font-serif">分享卡片</span>
                        </div>
                        {hasShare ? (
                          <div className="space-y-3">
                            {resultData.share.zh && (
                              <TypewriterText text={resultData.share.zh} className="text-sm font-serif leading-relaxed" />
                            )}
                            {resultData.share.en && (
                              <TypewriterText text={resultData.share.en} className="text-xs text-stone-200 leading-relaxed" speed={20} />
                            )}
                            <div className="flex flex-wrap gap-2 items-center pt-2">
                              <button
                                onClick={() => handleCopy(resultData.share.zh, 'zh')}
                                disabled={!resultData.share.zh}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                              >
                                <Copy size={12} /> 复制中文
                              </button>
                              <button
                                onClick={() => handleCopy(resultData.share.en, 'en')}
                                disabled={!resultData.share.en}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                              >
                                <Copy size={12} /> 复制英文
                              </button>
                              {copyStatus && (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-200 animate-fade-in">
                                  <CheckCircle2 size={12} /> 已复制{copyStatus === 'zh' ? '中文' : '英文'}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm font-serif text-stone-200">暂无分享文案。</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeInsight && (
        <CultureModal
          isOpen={showCultureModal}
          onClose={() => setShowCultureModal(false)}
          data={{
            title: activeInsight.title,
            subtitle: activeInsight.subtitle,
            tags: activeInsight.tags,
            description: activeInsight.description,
            detailedContent: activeInsight.detailedContent,
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs px-4 py-2 rounded-full shadow-float animate-fade-in">
          {toast}
        </div>
      )}

      {/* 案例画廊模态框 */}
      {showDemoCases && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-ink">案例画廊</h3>
                <p className="text-xs text-stone-500 mt-1">选择一个案例开始体验</p>
              </div>
              <button
                onClick={() => setShowDemoCases(false)}
                className="p-2 hover:bg-stone-100 rounded-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {DEMO_CASES.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => loadDemoCase(demo)}
                    className="group text-left bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-md transition-all hover:scale-[1.02]"
                  >
                    <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={demo.thumbnail}
                        alt={demo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-serif font-bold text-ink mb-1">{demo.title}</h4>
                      <p className="text-xs text-stone-500 mb-2 line-clamp-2">{demo.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {demo.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录模态框 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-ink">生成历史</h3>
                <p className="text-xs text-stone-500 mt-1">共 {history.length} 条记录</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-stone-100 rounded-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <History size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">暂无生成历史</p>
                  <p className="text-xs mt-2">识别图片后会自动保存记录</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="group text-left bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                      <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt="历史记录"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-stone-400">
                            {new Date(item.timestamp).toLocaleString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs text-stamp">{item.result.elements.length} 个元素</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.result.elements.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-ink/90 text-white rounded-sm">
                              #{tag}
                            </span>
                          ))}
                          {item.result.elements.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-sm">
                              +{item.result.elements.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// 打字机文本组件
const TypewriterText: React.FC<{ text: string; className?: string; speed?: number }> = ({ 
  text, 
  className = '', 
  speed = 30 
}) => {
  const { displayText, isTyping } = useTypewriter(text, speed);
  
  return (
    <p className={className}>
      {displayText}
      {isTyping && <span className="animate-pulse">|</span>}
    </p>
  );
};

// 打字机区块组件
const TypewriterSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode 
}> = ({ title, icon, children }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-ink font-serif">
        {icon}
        {title}
      </div>
      <div className="bg-stone-50 rounded-sm p-4">
        {children}
      </div>
    </div>
  );
};

// 文化解读卡片组件
const InsightCard: React.FC<{
  insight: CultureInsight;
  index: number;
  onClick: () => void;
}> = ({ insight, index, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-stone-200 rounded-sm p-4 hover:shadow-md hover:border-stamp transition-all group animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-serif font-bold text-ink group-hover:text-stamp transition-colors">
          {insight.title}
        </span>
        {insight.subtitle && (
          <span className="text-[10px] text-stone-400 ml-2">{insight.subtitle}</span>
        )}
      </div>
      <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
        {insight.description}
      </p>
      {insight.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {insight.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 group-hover:bg-stamp/10 group-hover:text-stamp transition-colors"
            >
              {tag}
            </span>
          ))}
          {insight.tags.length > 3 && (
            <span className="text-[10px] text-stone-400">+{insight.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
};
