import React from 'react';
import { Heart, MessageCircle, MapPin, UserPlus } from 'lucide-react';

export const Community: React.FC = () => {
  const posts = [
    { id: 1, user: 'Sarah (UK)', title: '茶不仅是饮料，是生活艺术！', img: 'https://picsum.photos/400/300', tags: ['#茶文化', '#慢生活'] },
    { id: 2, user: 'Mike (USA)', title: '这里的地铁太干净了，震惊。', img: 'https://picsum.photos/400/301', tags: ['#中国基建', '#反差'] },
    { id: 3, user: 'Yuki (JP)', title: '在胡同里发现了这个宝藏咖啡馆。', img: 'https://picsum.photos/400/302', tags: ['#胡同', '#探店'] },
  ];

  return (
    <div className="min-h-screen bg-paper p-4 pb-24 bg-texture">
      <h1 className="text-3xl font-serif font-bold text-ink mb-1 pt-8">视角交换</h1>
      <p className="text-xs text-stone-500 tracking-[0.2em] uppercase mb-8">Perspective Swap</p>
      
      {/* Topics */}
      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
        {['#真实中国', '#街头美食', '#夜游中国', '#意想不到'].map((tag, i) => (
          <div key={i} className={`px-4 py-2 bg-white border rounded-sm font-serif text-sm shadow-sm whitespace-nowrap transition-colors cursor-pointer ${i === 0 ? 'border-stamp text-stamp bg-red-50' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}>
            {tag}
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="columns-2 gap-4 space-y-4">
        {posts.map(post => (
          <div key={post.id} className="break-inside-avoid bg-white rounded-sm shadow-paper border border-stone-100 overflow-hidden hover:shadow-float transition-shadow group cursor-pointer">
            <div className="relative">
                <img src={post.img} alt={post.title} className="w-full object-cover sepia-[0.1]" />
                <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                    {post.tags.slice(0, 1).map(t => <span key={t} className="text-[9px] bg-black/60 backdrop-blur text-white px-1.5 py-0.5 rounded-sm">{t}</span>)}
                </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-bold text-sm leading-tight text-ink mb-3 font-serif line-clamp-2">{post.title}</h3>
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[10px] flex items-center gap-1"><MapPin size={10}/> 北京</span>
                <div className="flex gap-2">
                    <Heart size={14} className="hover:text-stamp transition-colors"/>
                    <MessageCircle size={14} className="hover:text-ink transition-colors"/>
                </div>
              </div>
            </div>
            
            <div className="px-3 pb-3 pt-2 border-t border-stone-50">
                <div className="text-[10px] text-stone-500 flex items-center gap-1">
                    <div className="w-4 h-4 bg-stone-200 rounded-full"></div>
                    <span className="font-sans">{post.user}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Match Banner */}
      <div className="mt-8 bg-ink text-paper rounded-sm p-6 relative overflow-hidden shadow-float group cursor-pointer">
        <div className="absolute inset-0 bg-stone-800 transition-colors group-hover:bg-black"></div>
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <UserPlus size={100} />
        </div>
        
        <div className="relative z-10 flex flex-col items-start">
            <span className="bg-stamp text-white text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest mb-2">Social</span>
            <h3 className="font-serif text-xl font-bold mb-1">结识本地向导</h3>
            <p className="text-xs text-stone-400 mb-4 font-light">与中国大学生匹配，交换视角，共创旅图。</p>
            <button className="bg-white text-ink px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors">
                开始匹配
            </button>
        </div>
      </div>
    </div>
  );
};