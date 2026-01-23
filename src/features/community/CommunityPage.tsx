import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useCommunityData } from './hooks/useCommunityData';
import { PostCard } from './components/PostCard';
import { FilterBar } from './components/FilterBar';
import { PostDetailModal } from './components/PostDetailModal';
import { type CommunityPost } from './community.data';

export const CommunityPage: React.FC = () => {
  const { posts, selectedTag, setSelectedTag } = useCommunityData();
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  return (
    <div className="min-h-full bg-paper p-4 pb-8 bg-texture">
      {/* 标题 */}
      <h1 className="text-3xl font-serif font-bold text-ink mb-1 pt-8">社区灵感</h1>
      <p className="text-xs text-stone-500 tracking-[0.2em] uppercase mb-8">旅图分享</p>

      {/* 筛选栏 */}
      <FilterBar selectedTag={selectedTag} onTagSelect={setSelectedTag} />

      {/* 瀑布流布局 */}
      <div className="columns-2 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>

      {/* 帖子详情模态框 */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* 加入社区 CTA */}
      <div className="mt-8 bg-ink text-paper rounded-sm p-6 relative overflow-hidden shadow-float group cursor-pointer">
        <div className="absolute inset-0 bg-stone-800 transition-colors group-hover:bg-black"></div>
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
          <UserPlus size={100} />
        </div>

        <div className="relative z-10 flex flex-col items-start">
          <span className="bg-stamp text-white text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest mb-2">
            加入
          </span>
          <h3 className="font-serif text-xl font-bold mb-1">成为旅图共创者</h3>
          <p className="text-xs text-stone-400 mb-4 font-light">
            分享你的照片与故事，点亮他人的旅程灵感。
          </p>
          <button className="bg-white text-ink px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors">
            立即加入
          </button>
        </div>
      </div>
    </div>
  );
};
