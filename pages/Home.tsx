import React from 'react';
import { Sun, Cloud, Battery, Zap, ArrowRight, Stamp, Sparkles } from 'lucide-react';
import { Tab } from '../types';

interface HomeProps {
  onNavigate: (tab: Tab) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-paper pb-24 bg-texture">
      {/* Header Card */}
      <div className="bg-white border-b border-stone-200 p-6 pt-12 rounded-b-[2rem] shadow-paper relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] p-4 opacity-[0.08] pointer-events-none">
            <Stamp size={180} className="text-ink rotate-12"/>
        </div>
        
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] bg-ink text-white px-1.5 py-0.5 rounded-sm tracking-widest uppercase">Location</span>
                 <h2 className="text-stone-500 text-xs tracking-widest font-bold uppercase">中国 · 北京</h2>
            </div>
            <h1 className="text-4xl font-serif font-bold text-ink">Day 02</h1>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-ink bg-stone-100/50 px-3 py-1.5 rounded-full border border-stone-200 backdrop-blur-sm">
                <Sun size={16} className="text-amber-600" />
                <span className="text-xs font-serif font-bold">24°C 晴</span>
            </div>
          </div>
        </div>

        {/* Quote of the Day */}
        <div className="relative py-4 border-t border-stone-100">
            <div className="absolute left-0 top-4 w-1 h-8 bg-stamp rounded-full"></div>
            <p className="font-serif italic text-lg text-ink/80 pl-4 leading-relaxed">"读万卷书，行万里路。"</p>
            <p className="text-[10px] text-stone-400 pl-4 mt-1 uppercase tracking-widest">— The journey is the destination.</p>
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Progress System */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
             <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stamp"></span>
                今日进阶
             </h3>
             <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-2 py-1 rounded-sm tracking-wider">LEVEL 1: 新手</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
                { label: '接入', en:'Access', val: 80, color: 'bg-blue-600', text: 'text-blue-600', icon: Zap },
                { label: '看见', en:'Vision', val: 30, color: 'bg-emerald-600', text: 'text-emerald-600', icon: Cloud },
                { label: '表达', en:'Express', val: 5, color: 'bg-amber-600', text: 'text-amber-600', icon: Battery },
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm flex flex-col items-center group hover:shadow-md transition-all">
                    <div className="w-full bg-stone-100 h-1.5 rounded-full mb-3 overflow-hidden">
                        <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${item.val}%` }}></div>
                    </div>
                    <item.icon size={18} className={`mb-2 ${item.text} opacity-80`} strokeWidth={1.5}/>
                    <span className="text-sm font-serif font-bold text-ink">{item.label}</span>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400">{item.en}</span>
                </div>
            ))}
          </div>
        </section>

        {/* Today's Mission */}
        <section>
          <h3 className="font-serif font-bold text-lg text-ink mb-4 px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stamp"></span>
            今日探索
          </h3>
          <div className="space-y-4">
            <button 
                onClick={() => onNavigate(Tab.MAP)}
                className="w-full flex items-center justify-between p-5 bg-white border border-stone-200 rounded-sm shadow-sm active:scale-[0.98] transition-all hover:border-blue-200 group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                        <Zap size={22} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                        <p className="font-serif font-bold text-ink text-lg">打开“生存锦囊”</p>
                        <p className="text-xs text-sub mt-0.5">交通卡、支付码、紧急联络已就绪</p>
                    </div>
                </div>
                <ArrowRight size={20} className="text-stone-300 group-hover:text-blue-600 transition-colors" />
            </button>

            <button 
                onClick={() => onNavigate(Tab.DIARY)}
                className="w-full flex items-center justify-between p-5 bg-white border border-stone-200 rounded-sm shadow-sm active:scale-[0.98] transition-all hover:border-amber-200 group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-50 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                        <Sun size={22} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                        <p className="font-serif font-bold text-ink text-lg">记录“现实一眼”</p>
                        <p className="text-xs text-sub mt-0.5">拍摄此刻，生成“印象vs现实”反差图</p>
                    </div>
                </div>
                <div className="px-2 py-1 bg-stamp/10 text-stamp text-[10px] font-bold rounded-sm border border-stamp/20 flex items-center gap-1">
                    <Sparkles size={10}/> XP+50
                </div>
            </button>
          </div>
        </section>

        {/* Timeline Preview */}
        <section>
            <h3 className="font-serif font-bold text-lg text-ink mb-4 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stamp"></span>
                旅途印记
            </h3>
            <div className="relative pl-6 ml-2 border-l border-dashed border-stone-300 space-y-8 pb-4">
                <div className="relative group cursor-pointer">
                    <div className="absolute -left-[31px] top-3 w-4 h-4 bg-white border-2 border-stone-300 rounded-full group-hover:border-stamp transition-colors">
                        <div className="w-1.5 h-1.5 bg-stone-300 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:bg-stamp"></div>
                    </div>
                    <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm rotate-1 transition-transform group-hover:rotate-0 group-hover:shadow-md relative">
                        <div className="absolute -top-2 left-4 w-12 h-4 bg-stone-100/80 -rotate-2"></div> {/* Tape */}
                        <div className="flex justify-between items-start mb-2">
                             <div className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">Yesterday • 14:00</div>
                             <Stamp size={16} className="text-stone-200"/>
                        </div>
                        <p className="font-serif text-ink italic leading-relaxed">"故宫比电影里看到的要宏大得多，红墙金瓦在阳光下..."</p>
                        <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-stone-100 text-[10px] font-serif text-stone-600 border border-stone-200">#历史感</span>
                            <span className="px-2 py-1 bg-stone-100 text-[10px] font-serif text-stone-600 border border-stone-200">#中国红</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};