import { useState, useMemo } from 'react';
import { MOCK_POSTS, type CommunityPost } from '../community.data';

export const useCommunityData = () => {
  const [posts] = useState<CommunityPost[]>(MOCK_POSTS);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 过滤帖子
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => post.tags.includes(selectedTag));
  }, [posts, selectedTag]);

  return {
    posts: filteredPosts,
    allPosts: posts,
    selectedTag,
    setSelectedTag,
  };
};
