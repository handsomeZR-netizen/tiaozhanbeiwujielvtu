import React, { useState } from 'react';
import { Upload, Sparkles, Tag, Share2, AlertTriangle, X, ArrowUpRight } from 'lucide-react';
import { AgentFlow } from '../components/AgentFlow';
import { CultureModal } from '../components/CultureModal';

export const Studio: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(false);
  const [showCultureModal, setShowCultureModal] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const processImage = () => {
    setProcessing(true);
  };

  return (
    <div className="min-h-screen bg-paper p-5 pb-24 bg-texture">
      <h1 className="text-3xl font-serif font-bold text-ink mb-1 pt-8">灵感工坊</h1>
      <p className="text-xs text-stone-500 tracking-[0.2em] uppercase mb-8">AIGC Studio</p>

      <div className="grid grid-cols-1 gap-6">
        {/* Upload Area */}
        <div className={`border-2 border-dashed border-stone-300 rounded-sm p-8 flex flex-col items-center justify-center bg-white/50 transition-all hover:bg-white hover:border-stone-400 hover:shadow-sm ${image ? 'h-72' : 'h-56'}`}>
          {image ? (
            <div className="relative w-full h-full group">
              <img src={image} className="w-full h-full object-contain shadow-sm" alt="Upload" />
              <button 
                onClick={() => setImage(null)} 
                className="absolute -top-3 -right-3 bg-ink text-white p-1.5 rounded-full shadow-md hover:bg-red-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer text-center group">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-stone-200 transition-colors">
                  <Upload size={24} className="text-stone-400 group-hover:text-stone-600" strokeWidth={1.5} />
              </div>
              <span className="text-stone-600 font-serif font-bold text-lg">上传随手拍</span>
              <p className="text-xs text-stone-400 mt-2">支持 JPG, PNG · 最大 10MB</p>
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>

        {/* Style Select */}
        <div className="space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">风格滤镜 (Filters)</span>
            <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar px-1">
                {['赛博朋克', '水墨写意', '极简主义', '人文纪实'].map((style, i) => (
                    <button key={i} className="px-5 py-2.5 bg-white border border-stone-200 rounded-sm text-sm font-serif font-medium hover:border-stamp hover:text-stamp whitespace-nowrap shadow-sm transition-all active:scale-95 text-stone-600">
                        {style}
                    </button>
                ))}
            </div>
        </div>

        {image && !processing && !result && (
            <button 
                onClick={processImage}
                className="bg-ink text-paper py-4 rounded-sm font-serif font-bold text-lg shadow-float flex justify-center items-center gap-2 hover:bg-black transition-colors"
            >
                <Sparkles size={18} /> 点亮灵感
            </button>
        )}

        {/* Agent Visualization */}
        <AgentFlow isRunning={processing} onComplete={() => {setProcessing(false); setResult(true);}} />

        {/* Result Deck */}
        {result && (
            <div className="animate-slide-up space-y-6">
                <div className="bg-white p-5 rounded-sm shadow-float border border-stone-100">
                    <div className="aspect-square bg-stone-100 rounded-sm mb-4 overflow-hidden relative group cursor-pointer">
                        <img src="https://picsum.photos/400/400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Generated" />
                        <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                            {['#北京', '#夜生活', '#文化解码'].map(tag => (
                                <span key={tag} className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-sm border border-white/20">{tag}</span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Cultural Decoding (Clickable) */}
                    <div 
                        className="bg-blue-50/50 p-4 rounded-sm border border-blue-100 mb-4 relative overflow-hidden cursor-pointer hover:bg-blue-50 transition-colors group select-none"
                        onClick={() => setShowCultureModal(true)}
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                        <div className="flex items-start gap-3">
                            <Tag size={16} className="text-blue-600 mt-1 shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-bold text-blue-900 text-sm font-serif flex items-center gap-2">
                                    识别元素：广场舞 (Square Dancing)
                                </h4>
                                <p className="text-blue-800/80 text-xs mt-1 leading-relaxed font-sans line-clamp-2">
                                    "Z世代解读：这不仅仅是锻炼，更是中国老年人的社交元宇宙。每一个动作都蕴含着群体的默契。"
                                </p>
                            </div>
                            <div className="text-blue-300 group-hover:text-blue-500 transition-colors">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-ink text-paper py-3 rounded-sm text-sm font-bold font-serif flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                            <Share2 size={16} /> 一键分享
                        </button>
                         <div className="px-4 py-3 bg-emerald-50 text-emerald-700 rounded-sm flex items-center gap-2 border border-emerald-100" title="安全审核通过">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold">已审核</span>
                         </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <CultureModal 
          isOpen={showCultureModal} 
          onClose={() => setShowCultureModal(false)}
          data={{
              title: "广场舞",
              subtitle: "Square Dancing",
              tags: ["#社交 (Social)", "#活力 (Vitality)", "#群体 (Community)"],
              description: "Z世代解读：这不仅仅是锻炼，更是中国老年人的社交元宇宙。每一个动作都蕴含着群体的默契。",
              detailedContent: "广场舞（Square Dancing）是中国城市公共空间中独特的文化景观。每当夜幕降临，公园和广场便成为中老年人的舞台。它体现了中国集体主义文化的延续，以及老年群体对社交和健康的双重追求。对于年轻人来说，这不仅是'噪音'，更是一种充满生命力的生活方式宣告，一种独特的'中式赛博朋克'。"
          }}
      />
    </div>
  );
};