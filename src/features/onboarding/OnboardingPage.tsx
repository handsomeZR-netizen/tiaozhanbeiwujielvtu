import React, { useState } from 'react';
import { OnboardingProfile } from '@/shared/types';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onFinish: (profile: OnboardingProfile) => void;
}

export const OnboardingPage: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>({
    name: '旅人',
    originCountry: '中国',
    destinationCity: '杭州',
    interests: [],
    impressionTags: [],
  });

  const interests = ['美食探店', '博物馆', '街巷漫步', '自然风景', '非遗手作'];
  const impressions = ['古朴', '热闹', '宁静', '浪漫', '烟火气', '现代'];

  const toggleSelection = (field: 'interests' | 'impressionTags', item: string) => {
    setProfile((prev) => {
      const list = prev[field];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onFinish(profile);
  };

  return (
    <div className="min-h-screen bg-paper p-8 pt-12 flex flex-col bg-texture">
      <div className="flex justify-center mb-8">
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-stamp' : 'bg-stone-200'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full">
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <span className="text-xs font-bold text-stamp tracking-widest uppercase mb-2 block">步骤 01</span>
              <h2 className="text-3xl font-serif font-bold text-ink mb-3">你的旅程起点</h2>
              <p className="text-sub font-light leading-relaxed">告诉我们你的出发地与目的地，方便匹配更合适的推荐。</p>
            </div>

            <div className="space-y-8 bg-white/50 p-6 rounded-sm border border-stone-200 shadow-sm">
              <div className="relative group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-stamp transition-colors">出发地</label>
                <input
                  type="text"
                  value={profile.originCountry}
                  onChange={(e) => setProfile({ ...profile, originCountry: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-300 py-2 text-xl font-serif text-ink focus:border-stamp outline-none transition-colors"
                />
              </div>
              <div className="relative group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-stamp transition-colors">目的地城市</label>
                <input
                  type="text"
                  value={profile.destinationCity}
                  onChange={(e) => setProfile({ ...profile, destinationCity: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-300 py-2 text-xl font-serif text-ink focus:border-stamp outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <span className="text-xs font-bold text-stamp tracking-widest uppercase mb-2 block">步骤 02</span>
              <h2 className="text-3xl font-serif font-bold text-ink mb-3">你感兴趣的主题</h2>
              <p className="text-sub font-light">选择你喜欢的文化方向，便于生成更匹配的内容。</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {interests.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleSelection('interests', tag)}
                  className={`px-5 py-3 rounded-sm border transition-all duration-300 font-serif ${
                    profile.interests.includes(tag)
                      ? 'bg-ink text-paper border-ink shadow-lg -translate-y-1'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <span className="text-xs font-bold text-stamp tracking-widest uppercase mb-2 block">步骤 03</span>
              <h2 className="text-3xl font-serif font-bold text-ink mb-3">目的地第一印象</h2>
              <p className="text-sub font-light">最多选择 3 项，帮助我们理解你的风格偏好。</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {impressions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleSelection('impressionTags', tag)}
                  className={`p-4 border rounded-sm text-left transition-all duration-300 relative overflow-hidden group ${
                    profile.impressionTags.includes(tag)
                      ? 'bg-red-50 border-stamp text-stamp'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="font-serif font-bold text-lg">{tag}</span>
                    {profile.impressionTags.includes(tag) && <Check size={18} strokeWidth={2.5} />}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-50/50 border border-amber-100 rounded-sm text-xs text-amber-800 flex gap-3 items-start">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span className="leading-relaxed">这些标签会影响默认风格与推荐内容，之后也可以随时调整。</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={nextStep}
        className="w-full max-w-sm mx-auto bg-stamp text-white py-4 rounded-sm font-serif font-bold text-lg shadow-paper hover:shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
      >
        {step === 3 ? '完成进入' : '下一步'} <ArrowRight size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
};
