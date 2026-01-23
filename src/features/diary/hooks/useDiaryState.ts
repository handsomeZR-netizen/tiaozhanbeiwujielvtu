import { useCallback, useMemo, useState } from 'react';
import {
  platforms,
  sizes,
  styles,
  templates,
  themes,
  type PromptLayerKey,
} from '@/features/diary/diary.data';
import type { PosterForm } from '@/features/diary/diary.utils';

type PanelKey = 'basic' | 'layers' | 'style' | 'platform' | 'template';

const defaultForm: PosterForm = {
  prompt: '',
  city: '合肥',
  theme: themes[0],
  style: styles[0],
  language: 'bilingual',
  platform: platforms[0],
  size: sizes[0],
  keywords: '徽派建筑, 夜色, 老街',
  template: templates[0].id,
};

const defaultSelectedLayers: Record<PromptLayerKey, string[]> = {
  realism: ['写实摄影'],
  lighting: [],
  tone: [],
  composition: [],
  texture: [],
  layout: [],
};

const defaultLayerGroupOpen: Record<PromptLayerKey, boolean> = {
  realism: true,
  lighting: false,
  tone: false,
  composition: false,
  texture: false,
  layout: false,
};

const defaultPanelOpen: Record<PanelKey, boolean> = {
  basic: true,
  layers: true,
  style: false,
  platform: false,
  template: true,
};

export const useDiaryState = () => {
  const [form, setForm] = useState<PosterForm>(defaultForm);
  const [selectedLayers, setSelectedLayers] = useState<Record<PromptLayerKey, string[]>>(defaultSelectedLayers);
  const [layerGroupOpen, setLayerGroupOpen] = useState<Record<PromptLayerKey, boolean>>(defaultLayerGroupOpen);
  const [panelOpen, setPanelOpen] = useState<Record<PanelKey, boolean>>(defaultPanelOpen);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const updateForm = useCallback((patch: Partial<PosterForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const appendKeyword = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords ? `${prev.keywords}, ${value}` : value,
    }));
  }, []);

  const toggleLayer = useCallback((key: PromptLayerKey, value: string) => {
    setSelectedLayers((prev) => {
      const currentValues = prev[key];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [key]: nextValues };
    });
  }, []);

  const toggleLayerGroup = useCallback((key: PromptLayerKey) => {
    setLayerGroupOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const applyExampleLayers = useCallback((layers: Record<PromptLayerKey, string[]>) => {
    setSelectedLayers(layers);
  }, []);

  const togglePanel = useCallback((key: PanelKey) => {
    setPanelOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const expandAllPanels = useCallback(() => {
    setPanelOpen({
      basic: true,
      layers: true,
      style: true,
      platform: true,
      template: true,
    });
  }, []);

  const compactPanels = useCallback(() => {
    setPanelOpen({
      basic: true,
      layers: true,
      style: false,
      platform: false,
      template: true,
    });
  }, []);

  const canGenerate = useMemo(() => form.city.trim().length > 0, [form.city]);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === form.template),
    [form.template],
  );
  const previewAspectRatio = useMemo(() => {
    const [width, height] = form.size.split('x').map((value) => Number.parseFloat(value));
    if (!width || !height) return 3 / 4;
    return width / height;
  }, [form.size]);
  const baseKeywords = useMemo(
    () =>
      form.keywords
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [form.keywords],
  );
  const layerKeywords = useMemo(
    () => Array.from(new Set(Object.values(selectedLayers).flat())),
    [selectedLayers],
  );
  const mergedKeywords = useMemo(() => {
    const pool = [...baseKeywords, ...layerKeywords, selectedTemplate?.name ?? ''].filter(Boolean);
    return Array.from(new Set(pool));
  }, [baseKeywords, layerKeywords, selectedTemplate?.name]);

  return {
    form,
    updateForm,
    appendKeyword,
    selectedLayers,
    toggleLayer,
    layerGroupOpen,
    toggleLayerGroup,
    applyExampleLayers,
    panelOpen,
    togglePanel,
    expandAllPanels,
    compactPanels,
    isHistoryOpen,
    setIsHistoryOpen,
    canGenerate,
    selectedTemplate,
    previewAspectRatio,
    layerKeywords,
    mergedKeywords,
  };
};
