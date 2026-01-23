import React from 'react';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { type CommunityPost, COUNTRY_FLAGS } from '../community.data';

interface PostCardProps {
  post: CommunityPost;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const countryFlag = COUNTRY_FLAGS[post.user.country] || '🌍';

  return (
    <div
      onClick={onClick}
      className="break-inside-avoid bg-white rounded-sm shadow-paper border border-stone-100 overflow-hidden hover:shadow-float transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer mb-4"
    >
      {/* 图片 */}
      <div className="relative">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-auto object-contain sepia-[0.05]"
          loading="lazy"
        />
        {/* 标签 */}
        <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] bg-black/60 backdrop-blur text-white px-1.5 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 2 && (
            <span className="text-[9px] bg-black/60 backdrop-blur text-white px-1.5 py-0.5 rounded-sm">
              +{post.tags.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div className="p-3">
        <h3 className="font-bold text-sm leading-tight text-ink mb-2 font-serif line-clamp-2">
          {post.title}
        </h3>

        {/* 用户信息 */}
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <div className="text-[10px] flex items-center gap-1">
            <span className="font-sans">
              {post.user.name} {countryFlag}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-0.5 hover:text-stamp transition-colors">
              <Heart size={14} />
              <span className="text-[10px]">{post.likes}</span>
            </button>
            <button className="flex items-center gap-0.5 hover:text-ink transition-colors">
              <MessageCircle size={14} />
              <span className="text-[10px]">{post.comments}</span>
            </button>
          </div>
        </div>

        {/* 位置 */}
        <div className="flex items-center gap-1 text-stone-500">
          <MapPin size={10} />
          <span className="text-[10px]">{post.location}</span>
        </div>
      </div>

      {/* 文化提示 */}
      {post.culturalTip && (
        <div className="px-3 pb-3 pt-1">
          <div className="text-[9px] text-amber-700 bg-amber-50 px-2 py-1 rounded-sm border-l-2 border-amber-400">
            💡 {post.culturalTip}
          </div>
        </div>
      )}
    </div>
  );
};
