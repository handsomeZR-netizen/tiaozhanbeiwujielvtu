import React from 'react';
import { X, Heart, MessageCircle, MapPin, DollarSign } from 'lucide-react';
import { type CommunityPost, COUNTRY_FLAGS } from '../community.data';

interface PostDetailModalProps {
  post: CommunityPost;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  const countryFlag = COUNTRY_FLAGS[post.user.country] || '🌍';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors z-10"
        >
          <X size={20} className="text-ink" />
        </button>

        {/* 图片 */}
        <div className="relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full object-cover sepia-[0.05] aspect-[16/9]"
          />
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 标题 */}
          <h2 className="text-2xl font-serif font-bold text-ink mb-3">{post.title}</h2>

          {/* 用户信息 */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-lg">
                {countryFlag}
              </div>
              <div>
                <div className="text-sm font-bold text-ink">
                  {post.user.name} {countryFlag}
                </div>
                <div className="text-xs text-stone-500">{post.timestamp}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-stone-600 hover:text-stamp transition-colors">
                <Heart size={18} />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 text-stone-600 hover:text-ink transition-colors">
                <MessageCircle size={18} />
                <span className="text-sm">{post.comments}</span>
              </button>
            </div>
          </div>

          {/* 位置和花费 */}
          <div className="flex gap-4 mb-4 text-sm text-stone-600">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={14} />
              <span>{post.cost}</span>
            </div>
          </div>

          {/* 正文 */}
          <p className="text-base text-ink leading-relaxed mb-4 font-serif">{post.content}</p>

          {/* 文化提示 */}
          {post.culturalTip && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <div className="text-xs font-bold text-amber-900 mb-1">文化提示</div>
                  <div className="text-sm text-amber-800">{post.culturalTip}</div>
                </div>
              </div>
            </div>
          )}

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-sm hover:bg-stone-200 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
