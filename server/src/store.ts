export type UserProfile = {
  name: string;
  originCountry: string;
  destinationCity: string;
  interests: string[];
  impressionTags: string[];
};

export type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  location?: string;
  tags?: string[];
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  user: string;
  title: string;
  img: string;
  tags: string[];
  location?: string;
  createdAt: string;
};

export type AtlasEntry = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
  tags?: string[];
  createdAt: string;
  note?: string;
};

export type PosterEntry = {
  id: string;
  city?: string;
  theme?: string;
  style?: string;
  language?: string;
  platform?: string;
  size?: string;
  promptRaw?: string;
  promptPolished?: string;
  prompt: string;
  imageUrl: string;
  copyTitle?: string;
  copySubtitle?: string;
  copyTitleRaw?: string;
  copySubtitleRaw?: string;
  copyTitlePolished?: string;
  copySubtitlePolished?: string;
  shareZh?: string;
  shareEn?: string;
  tags?: string[];
  createdAt: string;
};

let userProfile: UserProfile | null = null;
const diaries: DiaryEntry[] = [];
const communityPosts: CommunityPost[] = [];
const favorites: AtlasEntry[] = [];
const checkins: AtlasEntry[] = [];
const posters: PosterEntry[] = [];

export const store = {
  getUserProfile: () => userProfile,
  setUserProfile: (profile: UserProfile) => {
    userProfile = profile;
    return userProfile;
  },
  listDiaries: () => diaries,
  addDiary: (entry: DiaryEntry) => {
    diaries.unshift(entry);
    return entry;
  },
  listCommunityPosts: () => communityPosts,
  addCommunityPost: (post: CommunityPost) => {
    communityPosts.unshift(post);
    return post;
  },
  listFavorites: () => favorites,
  addFavorite: (entry: AtlasEntry) => {
    if (!favorites.find((item) => item.id === entry.id)) {
      favorites.unshift(entry);
    }
    return entry;
  },
  removeFavorite: (id: string) => {
    const index = favorites.findIndex((item) => item.id === id);
    if (index >= 0) favorites.splice(index, 1);
    return favorites;
  },
  listCheckins: () => checkins,
  addCheckin: (entry: AtlasEntry) => {
    if (!checkins.find((item) => item.id === entry.id)) {
      checkins.unshift(entry);
    }
    return entry;
  },
  listPosters: () => posters,
  addPoster: (entry: PosterEntry) => {
    posters.unshift(entry);
    return entry;
  },
  removePoster: (id: string) => {
    const index = posters.findIndex((item) => item.id === id);
    if (index >= 0) posters.splice(index, 1);
    return posters;
  },
};
