export type PosterRecord = {
  id: string;
  city?: string | null;
  theme?: string | null;
  style?: string | null;
  language?: string | null;
  platform?: string | null;
  size?: string | null;
  promptRaw?: string | null;
  promptPolished?: string | null;
  prompt: string;
  imageUrl: string;
  copyTitle?: string | null;
  copySubtitle?: string | null;
  copyTitleRaw?: string | null;
  copySubtitleRaw?: string | null;
  copyTitlePolished?: string | null;
  copySubtitlePolished?: string | null;
  shareZh?: string | null;
  shareEn?: string | null;
  tags?: string[];
  createdAt: string;
};

export type PosterForm = {
  city: string;
  theme: string;
  style: string;
  language: 'zh' | 'en' | 'bilingual';
  platform: string;
  size: string;
  keywords: string;
  template: string;
  prompt: string;
};

export const normalizeImageUrl = (value: string) =>
  value.startsWith('http') ? value : `data:image/png;base64,${value}`;

export type PosterPolishResult = {
  copyTitlePolished?: string;
  copySubtitlePolished?: string;
  promptPolished?: string;
};

export type ThinkingStep = {
  id: number;
  text: string;
  status: 'pending' | 'active' | 'completed';
};
