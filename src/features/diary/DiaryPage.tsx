import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { PosterPolishResult, ThinkingStep } from '@/features/diary/diary.utils';
import { normalizeImageUrl } from '@/features/diary/diary.utils';
import { DiaryCanvas } from '@/features/diary/components/DiaryCanvas';
import { DiaryConfigPanel } from '@/features/diary/components/DiaryConfigPanel';
import { DiaryHistory } from '@/features/diary/components/DiaryHistory';
import { DiaryHistoryPanel } from '@/features/diary/components/DiaryHistoryPanel';
import { DiaryShareModal } from '@/features/diary/components/DiaryShareModal';
import { useDiaryState } from '@/features/diary/hooks/useDiaryState';
import { useDiaryPosters } from '@/features/diary/hooks/useDiaryPosters';

export const DiaryPage: React.FC = () => {
  const {
    form,
    updateForm,
    appendKeyword,
    selectedLayers,
    toggleLayer,
    layerGroupOpen,
    toggleLayerGroup,
    applyExampleLayers,
    isHistoryOpen,
    setIsHistoryOpen,
    canGenerate,
    previewAspectRatio,
    layerKeywords,
    mergedKeywords,
  } = useDiaryState();

  const {
    history,
    current,
    loading,
    error,
    refreshHistory,
    generatePoster,
    deletePoster,
    selectPoster,
    polishPoster,
    polishLoading,
    polishError,
  } = useDiaryPosters();

  const [isGenerating, setIsGenerating] = useState(false);
  const [polishResult, setPolishResult] = useState<PosterPolishResult | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const stepTimers = useRef<number[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalClosing, setShareModalClosing] = useState(false);
  const [shareFolded, setShareFolded] = useState(false);
  const [shareDraft, setShareDraft] = useState<{ id: string; zh: string; en: string } | null>(null);
  const shareCloseTimer = useRef<number | null>(null);

  const fallbackTitle = useMemo(() => form.city || '旅行海报', [form.city]);
  const fallbackSubtitle = useMemo(() => `${form.theme} · ${form.style}`, [form.theme, form.style]);
  const displayTitle = useMemo(
    () =>
      current?.copyTitlePolished ||
      current?.copyTitle ||
      current?.copyTitleRaw ||
      current?.city ||
      fallbackTitle,
    [current, fallbackTitle],
  );
  const displaySubtitle = useMemo(
    () =>
      current?.copySubtitlePolished ||
      current?.copySubtitle ||
      current?.copySubtitleRaw ||
      current?.theme ||
      fallbackSubtitle,
    [current, fallbackSubtitle],
  );
  const currentId = current?.id;
  const useDraftShare = Boolean(shareDraft && currentId && shareDraft.id === currentId);
  const shareZh = useDraftShare ? shareDraft!.zh : current?.shareZh ?? '';
  const shareEn = useDraftShare ? shareDraft!.en : current?.shareEn ?? '';
  const sharePreview = shareZh || shareEn ? `${shareZh || ''} ${shareEn || ''}`.trim() : '';

  const handleGenerate = async () => {
    if (!canGenerate || isGenerating || loading) return;
    setIsGenerating(true);
    setThinkingSteps([
      { id: 1, text: '分析旅行叙事', status: 'active' },
      { id: 2, text: '融合风格与关键词', status: 'pending' },
      { id: 3, text: '渲染场景与光影', status: 'pending' },
      { id: 4, text: '生成分享文案', status: 'pending' },
    ]);

    stepTimers.current.forEach((timer) => window.clearTimeout(timer));
    stepTimers.current = [
      window.setTimeout(() => {
        setThinkingSteps((prev) =>
          prev.map((step) =>
            step.id === 1
              ? { ...step, status: 'completed' }
              : step.id === 2
              ? { ...step, status: 'active' }
              : step,
          ),
        );
      }, 900),
      window.setTimeout(() => {
        setThinkingSteps((prev) =>
          prev.map((step) =>
            step.id === 2
              ? { ...step, status: 'completed' }
              : step.id === 3
              ? { ...step, status: 'active' }
              : step,
          ),
        );
      }, 1800),
      window.setTimeout(() => {
        setThinkingSteps((prev) =>
          prev.map((step) =>
            step.id === 3
              ? { ...step, status: 'completed' }
              : step.id === 4
              ? { ...step, status: 'active' }
              : step,
          ),
        );
      }, 2700),
    ];

    const payload = {
      city: form.city.trim(),
      theme: form.theme,
      style: form.style,
      language: form.language,
      platform: form.platform,
      size: form.size,
      keywords: mergedKeywords,
      prompt: form.prompt.trim(),
      promptPolished: polishResult?.promptPolished,
      copyTitlePolished: polishResult?.copyTitlePolished,
      copySubtitlePolished: polishResult?.copySubtitlePolished,
    };

    try {
      const result = await generatePoster(payload);
      if (result) {
        setShareDraft({
          id: result.id,
          zh: result.shareZh ?? '',
          en: result.shareEn ?? '',
        });
        if (shareCloseTimer.current) {
          window.clearTimeout(shareCloseTimer.current);
          shareCloseTimer.current = null;
        }
        setShareModalOpen(true);
        setShareModalClosing(false);
        setShareFolded(false);
      }
    } finally {
      stepTimers.current.forEach((timer) => window.clearTimeout(timer));
      stepTimers.current = [];
      setThinkingSteps((prev) => prev.map((step) => ({ ...step, status: 'completed' })));
      window.setTimeout(() => setIsGenerating(false), 400);
    }
  };

  const handlePolish = async () => {
    const payload = {
      city: form.city.trim(),
      theme: form.theme,
      style: form.style,
      language: form.language,
      platform: form.platform,
      size: form.size,
      keywords: mergedKeywords,
      prompt: form.prompt.trim(),
    };
    const result = await polishPoster(payload);
    if (result) {
      setPolishResult({
        copyTitlePolished: result.copyTitlePolished,
        copySubtitlePolished: result.copySubtitlePolished,
        promptPolished: result.promptPolished,
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deletePoster(id);
  };

  const handleDownload = (record = current) => {
    if (!record?.imageUrl) return;
    const link = document.createElement('a');
    link.href = normalizeImageUrl(record.imageUrl);
    link.download = `${record.city ?? 'poster'}-${record.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyText = async (record = current) => {
    if (!record) return;
    const title =
      record.copyTitlePolished || record.copyTitle || record.copyTitleRaw || record.city || '';
    const subtitle =
      record.copySubtitlePolished || record.copySubtitle || record.copySubtitleRaw || record.theme || '';
    const text = `${title}\n${subtitle}`.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  const handleCopyShare = async () => {
    const text = [shareZh, shareEn].filter(Boolean).join('\n');
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  const handleCloseShareModal = () => {
    if (shareModalClosing) return;
    setShareModalClosing(true);
    if (shareCloseTimer.current) {
      window.clearTimeout(shareCloseTimer.current);
    }
    shareCloseTimer.current = window.setTimeout(() => {
      setShareModalOpen(false);
      setShareModalClosing(false);
      setShareFolded(true);
      shareCloseTimer.current = null;
    }, 600);
  };

  const handleExpandShare = () => {
    if (shareCloseTimer.current) {
      window.clearTimeout(shareCloseTimer.current);
      shareCloseTimer.current = null;
    }
    setShareFolded(false);
    setShareModalOpen(true);
    setShareModalClosing(false);
  };

  useEffect(() => {
    if (!current?.id) return;
    if (shareDraft && shareDraft.id !== current.id) {
      setShareDraft(null);
    }
    if (!shareModalOpen) {
      setShareFolded(Boolean(current.shareZh || current.shareEn));
    }
  }, [current?.id, shareDraft, shareModalOpen]);

  return (
    <div className="h-full w-full bg-brand-50 text-brand-900 overflow-hidden">
      <div className="flex h-full flex-col xl:flex-row">
        <DiaryConfigPanel
          form={form}
          onChange={updateForm}
          onGenerate={handleGenerate}
          canGenerate={canGenerate}
          isGenerating={isGenerating || loading}
          generateError={error}
          onPolish={handlePolish}
          polishLoading={polishLoading}
          polishError={polishError}
          polishResult={polishResult}
          onClearPolish={() => setPolishResult(null)}
          shareZh={shareZh}
          shareEn={shareEn}
          onCopyShare={handleCopyShare}
          selectedLayers={selectedLayers}
          layerGroupOpen={layerGroupOpen}
          onToggleGroup={toggleLayerGroup}
          onToggleLayer={toggleLayer}
          onAppendKeyword={appendKeyword}
          layerKeywords={layerKeywords}
          onApplyExample={applyExampleLayers}
        />

        <DiaryCanvas
          current={current}
          previewAspectRatio={previewAspectRatio}
          isGenerating={isGenerating || loading}
          thinkingSteps={thinkingSteps}
          fallbackTitle={displayTitle}
          fallbackSubtitle={displaySubtitle}
          shareFolded={shareFolded}
          sharePreview={sharePreview}
          onExpandShare={handleExpandShare}
          onCopyText={() => handleCopyText(current)}
          onDownload={() => handleDownload(current)}
        />

        <DiaryHistoryPanel
          history={history}
          currentId={current?.id}
          onSelect={selectPoster}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>

      <DiaryShareModal
        open={shareModalOpen}
        closing={shareModalClosing}
        title={displayTitle}
        subtitle={displaySubtitle}
        shareZh={shareZh}
        shareEn={shareEn}
        onClose={handleCloseShareModal}
        onCopy={handleCopyShare}
      />

      <div className="xl:hidden p-4 space-y-3">
        <DiaryHistory
          history={history}
          currentId={current?.id}
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen((prev) => !prev)}
          onSelect={selectPoster}
          onDelete={handleDelete}
        />
        <button
          type="button"
          onClick={() => refreshHistory()}
          className="w-full rounded-xl border border-brand-200 bg-white py-2 text-xs text-stone-500 hover:text-brand-900"
        >
          刷新历史
        </button>
      </div>
    </div>
  );
};
