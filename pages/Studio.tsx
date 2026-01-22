import React, { useState } from 'react';
import { Upload, Sparkles, Tag, Share2, AlertTriangle, X, ArrowUpRight } from 'lucide-react';
import { AgentFlow } from '../components/AgentFlow';
import { CultureModal } from '../components/CultureModal';

export const Studio: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(false);
  const [showCultureModal, setShowCultureModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('cyber');

  // Style options with placeholder images
  const STYLES = [
    { name: '赛博朋克', id: 'cyber', img: 'https://picsum.photos/seed/cyber/300/200' },
    { name: '水墨写意', id: 'ink', img: 'https://picsum.photos/seed/ink/300/200' },
    { name: '极简主义', id: 'minimal', img: 'https://picsum.photos/seed/minimal/300/200' },
    { name: '人文纪实', id: 'documentary', img: 'https://picsum.photos/seed/doc/300/200' },
  ];

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
    <div className="min-h-screen bg-paper p-5 md:p-8 pb-24 md:pb-8 bg-texture">
      <h1 className="text-3xl font-serif font-bold text-ink mb-1 pt-8 md:pt-4">灵感工坊</h1>
      <p className="text-xs text-stone-500 tracking-[0.2em] uppercase mb-8">AIGC Studio</p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Panel: Controls (Mobile: full width, Desktop: 4 columns) */}
        <div className="md:col-span-4 space-y-6">
          
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

          {/* Style Select - Image Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">风格滤镜 (Filters)</span>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <div 
                  key={style.id}
                  className={`relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer border-2 transition-all hover:shadow-md ${
                    selectedStyle === style.id ? 'border-stamp shadow-lg scale-[1.02]' : 'border-stone-200 hover:border-stone-300'
                  }`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <img src={style.img} className="object-cover w-full h-full" alt={style.name} />
                  <div className={`absolute bottom-0 w-full text-white text-xs py-2 text-center font-serif font-medium transition-all ${
                    selectedStyle === style.id ? 'bg-stamp' : 'bg-black/60 backdrop-blur-sm'
                  }`}>
                    {style.name}
                  </div>
                  {selectedStyle === style.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-stamp rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {image && !processing && !result && (
            <button 
              onClick={processImage}
              className="w-full bg-ink text-paper py-4 rounded-sm font-serif font-bold text-lg shadow-float flex justify-center items-center gap-2 hover:bg-black transition-colors active:scale-[0.98]"
            >
              <Sparkles size={18} /> 点亮灵感
            </button>
          )}
        </div>

        {/* Right Panel: Preview & Results (Mobile: full width, Desktop: 8 columns) */}
        <div className="md:col-span-8">
          <div className="md:sticky md:top-4 space-y-6">
            
            {/* Empty State */}
            {!result && !processing && (
              <div className="h-[500px] md:h-[600px] border-2 border-dashed border-stone-200 rounded-sm flex flex-col items-center justify-center text-stone-300 bg-white/30">
                <Camera size={64} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-lg font-serif text-stone-400">预览区域</p>
                <p className="text-xs text-stone-400 mt-2">上传图片并选择风格后开始创作</p>
              </div>
            )}

            {/* Agent Visualization */}
            <AgentFlow isRunning={processing} onComplete={() => {setProcessing(false); setResult(true);}} />

            {/* Result Deck */}
            {result && (
              <div className="animate-slide-up space-y-6">
                <div className="bg-white p-5 md:p-6 rounded-sm shadow-float border border-stone-100">
                  
                  {/* Desktop: Side-by-side layout */}
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Image */}
                    <div className="md:w-1/2">
                      <div className="aspect-square bg-stone-100 rounded-sm overflow-hidden relative group cursor-pointer">
                        <img src="https://picsum.photos/400/400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Generated" />
                        <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                          {['#北京', '#夜生活', '#文化解码'].map(tag => (
                            <span key={tag} className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-sm border border-white/20">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="md:w-1/2 flex flex-col justify-between space-y-4">
                      
                      {/* Cultural Decoding (Clickable) */}
                      <div 
                        className="bg-blue-50/50 p-4 rounded-sm border border-blue-100 relative overflow-hidden cursor-pointer hover:bg-blue-50 transition-colors group select-none"
                        onClick={() => setShowCultureModal(true)}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                        <div className="flex items-start gap-3">
                          <Tag size={16} className="text-blue-600 mt-1 shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-bold text-blue-900 text-sm font-serif flex items-center gap-2">
                              识别元素：广场舞 (Square Dancing)
                            </h4>
                            <p className="text-blue-800/80 text-xs mt-1 leading-relaxed font-sans line-clamp-3">
                              "Z世代解读：这不仅仅是锻炼，更是中国老年人的社交元宇宙。每一个动作都蕴含着群体的默契。"
                            </p>
                          </div>
                          <div className="text-blue-300 group-hover:text-blue-500 transition-colors">
                            <ArrowUpRight size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
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
                </div>
              </div>
            )}
          </div>
        </div>
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