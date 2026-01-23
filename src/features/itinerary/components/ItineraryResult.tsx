import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, DollarSign, Clock, Navigation, 
  Share2, Download, Edit3, Save, ChevronDown, ChevronUp, Star, ArrowLeft 
} from 'lucide-react';
import { ItineraryRecord, ItineraryDay, ItineraryActivity } from '../itinerary.types';

interface ItineraryResultProps {
  data: ItineraryRecord;
  onBack: () => void;
}

const ActivityCard: React.FC<{ activity: ItineraryActivity }> = ({ activity }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative pl-8 pb-10 last:pb-0 group">
      {/* Timeline Line (Dashed for cut-out effect) */}
      <div className="absolute left-[11px] top-8 bottom-0 w-[2px] border-l-2 border-dashed border-ink/20 group-last:hidden" aria-hidden="true" />
      
      {/* Timeline Dot (Pin) */}
      <div className="absolute left-0 top-3 w-6 h-6 rounded-full border-2 border-ink bg-paper-50 flex items-center justify-center shadow-sm z-10" aria-hidden="true">
        <div className={`w-2 h-2 rounded-full ${expanded ? 'bg-ink-accent' : 'bg-ink-light'}`} />
      </div>

      <div 
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${activity.title} - ${expanded ? '收起' : '展开'}详情`}
        className={`ml-4 rounded-sm p-5 cursor-pointer transition-all duration-300 relative border-l-4 ${
            expanded 
                ? 'bg-paper-50 shadow-neu-flat border-ink-accent scale-[1.01]' 
                : 'bg-paper-100 hover:bg-paper-50 border-transparent hover:shadow-neu-flat'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg text-ink-blue bg-ink-blue/10 px-2 py-0.5 rounded-sm">
                    {activity.time}
                </span>
                <span className="text-ink-light text-xs font-mono flex items-center gap-1 opacity-70">
                    <Clock size={12} /> {activity.duration}m
                </span>
            </div>
            <div className="text-ink-light opacity-50">
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
        </div>

        <h4 className="text-xl font-bold text-ink mb-2 tracking-tight">{activity.title}</h4>
        <p className="text-ink-light text-sm mb-3 leading-relaxed text-justify font-serif">
            {activity.description}
        </p>
        
        {expanded && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-dashed border-ink/20 space-y-4"
            >
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs font-bold border border-ink rounded-sm text-ink">{activity.category}</span>
                    {activity.estimatedCost !== undefined && (
                         <span className="px-2 py-1 text-xs font-bold border border-ink-light text-ink-light rounded-sm flex items-center gap-1">
                            <DollarSign size={10} /> {activity.estimatedCost}
                         </span>
                    )}
                </div>
                {activity.tips && (
                    <div className="bg-paper-200/50 p-3 rounded-sm border-l-2 border-ink-accent">
                        <p className="text-xs font-bold text-ink-accent mb-1 flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> 旅行贴士 TIPS:
                        </p>
                        <ul className="list-disc list-inside text-xs text-ink-light space-y-1 pl-1">
                            {activity.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                )}
                <div className="flex gap-3 mt-2">
                    <button className="flex-1 py-2 rounded-sm border border-ink text-ink text-xs font-bold hover:bg-ink hover:text-paper-50 transition-colors shadow-sm">
                        查看地图
                    </button>
                    <button className="flex-1 py-2 rounded-sm bg-paper-200 text-ink-light text-xs font-bold hover:bg-paper-300 transition-colors">
                        详细信息
                    </button>
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
};

const DaySection = ({ day }: { day: ItineraryDay }) => (
    <section className="mb-16 relative" aria-labelledby={`day-${day.dayNumber}-heading`}>
        {/* Sticky Date Header (Paper Note Style) */}
        <div className="sticky top-24 z-20 mb-8 -ml-4">
             <div className="inline-block bg-ink text-paper-50 px-6 py-2 shadow-paper transform -rotate-1">
                <h3 id={`day-${day.dayNumber}-heading`} className="text-xl font-bold flex items-center gap-2">
                    <span className="font-mono text-ink-accent">DAY {day.dayNumber}</span>
                    <span className="w-px h-4 bg-paper-50/30 mx-2" aria-hidden="true" />
                    <span>{new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                </h3>
             </div>
             <div className="mt-2 ml-4 flex items-center gap-4">
                 <span className="text-ink font-bold tracking-widest text-lg border-b-2 border-ink-accent/30">
                    {day.theme}
                 </span>
                 <div className="text-xs font-mono text-ink-light flex gap-3">
                    <span className="flex items-center gap-1" aria-label={`总距离 ${day.totalDistance} 公里`}><Navigation size={12} aria-hidden="true" /> {day.totalDistance}km</span>
                    <span className="flex items-center gap-1" aria-label={`总费用 ${day.totalCost} 元`}><DollarSign size={12} aria-hidden="true" /> {day.totalCost}</span>
                 </div>
             </div>
        </div>
        
        <div className="px-2 border-l border-ink/10 ml-4 pl-4 md:pl-8" role="list" aria-label={`第${day.dayNumber}天活动列表`}>
            {day.activities.map(act => <ActivityCard key={act.id} activity={act} />)}
        </div>
    </section>
);

export const ItineraryResult: React.FC<ItineraryResultProps> = ({ data, onBack }) => {
  return (
    <div className="min-h-screen pb-32 bg-paper-100" role="main" aria-label="行程结果">
        
        {/* Header Summary (Postcard Style) */}
        <header className="relative bg-paper-200 border-b border-ink/10 pt-12 pb-24 overflow-hidden">
            <div className="absolute inset-0 bg-paper-texture opacity-60 pointer-events-none" aria-hidden="true" />
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <button onClick={onBack} className="mb-8 text-sm font-bold text-ink-light hover:text-ink flex items-center gap-2 transition-colors" aria-label="返回重新规划">
                    <ArrowLeft size={16} aria-hidden="true" /> 重新规划
                </button>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <div className="inline-block border-2 border-ink p-1 mb-4">
                                <div className="bg-ink text-paper-50 px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase">
                                    Travel Itinerary
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-ink mb-6 tracking-tight">
                                {data.form.city}
                            </h1>
                            <p className="text-lg text-ink-light leading-relaxed font-serif text-justify border-l-4 border-ink-accent pl-6 italic">
                                "{data.summary}"
                            </p>
                        </motion.div>
                    </div>
                    
                    {/* Stamp Stats */}
                    <div className="flex flex-wrap gap-4 md:flex-col md:gap-4 md:w-48">
                        <div className="bg-paper-50 border border-ink/20 p-4 shadow-neu-flat rounded-sm rotate-2">
                            <div className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">Duration</div>
                            <div className="text-2xl font-mono font-bold text-ink flex items-center gap-2">
                                <Clock size={20} className="text-ink-blue" /> {data.days.length} 天
                            </div>
                        </div>
                        <div className="bg-paper-50 border border-ink/20 p-4 shadow-neu-flat rounded-sm -rotate-1">
                            <div className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">Spots</div>
                            <div className="text-2xl font-mono font-bold text-ink flex items-center gap-2">
                                <MapPin size={20} className="text-ink-accent" /> {data.totalSpots} 景点
                            </div>
                        </div>
                        <div className="bg-paper-50 border border-ink/20 p-4 shadow-neu-flat rounded-sm rotate-1">
                            <div className="text-xs font-bold text-ink-light uppercase tracking-wider mb-1">Budget</div>
                            <div className="text-2xl font-mono font-bold text-ink flex items-center gap-2">
                                <DollarSign size={20} className="text-green-700" /> {data.totalBudget}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* Timeline Content */}
        <main className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
            {data.days.map((day, i) => (
                <motion.div
                    key={day.dayNumber}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                >
                    <DaySection day={day} />
                </motion.div>
            ))}
            
            {/* End Mark */}
            <div className="flex justify-center mt-12 mb-24 opacity-50">
                <div className="w-16 h-1 bg-ink/20" />
            </div>
        </main>

        {/* Sticky Action Bar (Floating Toolbox) */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40" aria-label="行程操作">
            <div className="bg-paper-50 border-2 border-ink rounded shadow-paper flex justify-between items-center px-6 py-3">
                <button className="flex flex-col items-center gap-1 text-ink-light hover:text-ink transition-colors group" aria-label="保存行程">
                    <Save size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" /> 
                    <span className="text-[10px] font-bold">保存</span>
                </button>
                <div className="w-px h-8 bg-ink/10" aria-hidden="true" />
                <button className="flex flex-col items-center gap-1 text-ink-light hover:text-ink transition-colors group" aria-label="编辑行程">
                    <Edit3 size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" /> 
                    <span className="text-[10px] font-bold">编辑</span>
                </button>
                <div className="w-px h-8 bg-ink/10" aria-hidden="true" />
                <button className="flex flex-col items-center gap-1 text-ink-blue hover:text-ink-blue/80 transition-colors group" aria-label="分享行程">
                    <Share2 size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" /> 
                    <span className="text-[10px] font-bold">分享</span>
                </button>
                <div className="w-px h-8 bg-ink/10" aria-hidden="true" />
                <button className="flex flex-col items-center gap-1 text-ink-accent hover:text-ink-accent/80 transition-colors group" aria-label="导出PDF">
                    <Download size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" /> 
                    <span className="text-[10px] font-bold">导出PDF</span>
                </button>
            </div>
        </nav>
    </div>
  );
}
