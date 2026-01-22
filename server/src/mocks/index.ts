export const communityFeed = [
  {
    id: 'post_1',
    user: 'Sarah (UK)',
    title: '茶不只是饮料，也是生活艺术。',
    img: 'https://picsum.photos/seed/tea/400/300',
    tags: ['#茶文化', '#慢生活'],
    location: '北京',
  },
  {
    id: 'post_2',
    user: 'Mike (USA)',
    title: '这里的地铁太干净了，震撼。',
    img: 'https://picsum.photos/seed/subway/400/301',
    tags: ['#中国基建', '#反差'],
    location: '北京',
  },
  {
    id: 'post_3',
    user: 'Yuki (JP)',
    title: '在胡同里发现了这家宝藏咖啡馆。',
    img: 'https://picsum.photos/seed/cafe/400/302',
    tags: ['#胡同', '#探店'],
    location: '北京',
  },
];

export const mapRecommendations = [
  {
    id: 'poi_1',
    name: '天安门广场',
    lng: 116.397428,
    lat: 39.90923,
    reason: '经典地标，适合拍摄城市封面。',
  },
  {
    id: 'poi_2',
    name: '前门大街',
    lng: 116.404136,
    lat: 39.899428,
    reason: '传统街区与现代街景融合。',
  },
  {
    id: 'poi_3',
    name: '景山公园',
    lng: 116.397498,
    lat: 39.926874,
    reason: '俯瞰故宫的最佳观景点。',
  },
];

export const culturalDecodeSample = {
  title: '广场舞',
  subtitle: 'Square Dancing',
  tags: ['#社交', '#活力', '#社区'],
  description: '这不仅是锻炼，更是中国城市公共空间里的社交方式。',
  detailedContent:
    '广场舞在夜幕降临后成为城市公共空间的一部分，体现了集体文化与社区凝聚力。',
};

export const shareCardSample = {
  title: '无界旅图 · 旅途印记',
  description: '记录反差与惊喜的瞬间，一键分享你的城市发现。',
  coverUrl: 'https://picsum.photos/seed/share/800/600',
  qrCodeUrl: 'https://picsum.photos/seed/qr/200/200',
};

export const aiMockResult = {
  scene: {
    objects: ['广场', '人群', '夜景'],
    mood: '热闹',
  },
  context: {
    summary: '夜晚的广场舞反映了社区凝聚力与城市公共文化。',
    translations: {
      en: 'Night square dancing reflects community bonding and urban public culture.',
    },
  },
  image: {
    url: 'https://picsum.photos/seed/aigc/512/512',
  },
  tags: ['#夜景', '#城市生活', '#文化体验'],
};
