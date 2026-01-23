export type RatioPreset = {
  id: '1:1' | '3:4' | '4:3' | '9:16';
  size: string;
  hint?: string;
  disabled?: boolean;
};

export const ratioPresets: RatioPreset[] = [
  { id: '1:1', size: '2048x2048', hint: '1:1' },
  { id: '3:4', size: '2048x3072', hint: '3:4' },
  { id: '4:3', size: '3072x2048', hint: '4:3' },
  { id: '9:16', size: '2048x3072', hint: 'Not supported yet', disabled: true },
];
