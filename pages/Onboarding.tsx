import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onFinish: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Traveler',
    originCountry: '法国',
    destinationCity: '北京',
    interests: [],
    impressionTags: []
  });

  const interests = ['美食探秘 🍜', '历史古迹 🏛️', '自然风光 🌲', '城市夜游 🥂', '科技前沿 🤖'];
  const impressions = ['古老神秘', '人山人海', '中国功夫', '茶文化', '红灯笼', '高铁'];

  const toggleSelection = (field: 'interests' | 'impressionTags', item: string) => {
    setProfile(prev => {
      const list = prev[field];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(i => i !== item) };
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
      {/* Decorative Header */}
      <div className="flex justify-center mb-8">
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-stamp' : 'bg-stone-200'}`} />
            ))}
          </div>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full">
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="mb-8">
                <span className="text-xs font-bold text-stamp tracking-widest uppercase mb-2 block">Step 01</span>
                <h2 className="text-3xl font-serif font-bold text-ink mb-3">初来乍到</h2>
                <p className="text-sub font-light leading-relaxed">请完善您的旅行档案，我们将为您定制专属的<br/>“生存锦囊”。</p>
            </div>
            
            <div className="space-y-8 bg-white/50 p-6 rounded-sm border border-stone-200 shadow-sm">
              <div className="relative group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-stamp transition-colors">来自 (Origin)</label>
                <input 
                  type="text" 
                  value={profile.originCountry}
                  onChange={(e) => setProfile({...profile, originCountry: e.target.value})}
                  className="w-full bg-transparent border-b border-stone-300 py-2 text-xl font-serif text-ink focus:border-stamp outline-none transition-colors" 
                />
              </div>
              <div className="relative group">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-stamp transition-colors">目的地 (Destination)</label>
                <input 
                  type="text" 
                  value={profile.destinationCity}
                  onChange={(e) => setProfile({...profile, destinationCity: e.target.value})}
                  className="w-full bg-transparent border-b border-stone-300 py-2 text-xl font-serif text-ink focus:border-stamp outline-none transition-colors" 
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <div className="mb-8">
                <span className="text-xs font-bold text-stamp tracking-widest uppercase mb-2 block">Step 02</span>
                <h2 className="text-3xl font-serif font-bold text-ink mb-3">兴趣偏好</h2>
                <p className="text-sub font-light">您希望在这趟旅程中看见什么？</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {interests.map(tag => (
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
                <span className="text-xs font-bold text-stamp tracking-widest uppercase mb-2 block">Step 03</span>
                <h2 className="text-3xl font-serif font-bold text-ink mb-3">刻板印象？</h2>
                <p className="text-sub font-light">选择3个词，描述您出发前对这里的<br/>“预设印象”。</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {impressions.map(tag => (
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
                  {/* Decorative ink splash for selected items could go here */}
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-amber-50/50 border border-amber-100 rounded-sm text-xs text-amber-800 flex gap-3 items-start">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-amber-600"/>
              <span className="leading-relaxed">我们将根据这些选项，稍后为您生成“认知反差海报”，记录认知的改变。</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={nextStep}
        className="w-full max-w-sm mx-auto bg-stamp text-white py-4 rounded-sm font-serif font-bold text-lg shadow-paper hover:shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
      >
        {step === 3 ? '生成我的通关文牒' : '下一步'} <ArrowRight size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
};