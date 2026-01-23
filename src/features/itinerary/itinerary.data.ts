import { ItineraryRecord, Agent } from './itinerary.types';

export const POPULAR_CITIES = [
  { id: 'beijing', name: '中国北京' },
  { id: 'tokyo', name: '日本东京' },
  { id: 'paris', name: '法国巴黎' },
  { id: 'kyoto', name: '日本京都' },
  { id: 'london', name: '英国伦敦' },
  { id: 'shanghai', name: '中国上海' },
  { id: 'chengdu', name: '中国成都' },
];

export const INTEREST_TAGS = [
  { id: 'history', name: '历史古迹', icon: 'landmark', color: 'text-amber-700' },
  { id: 'food', name: '地道美食', icon: 'utensils', color: 'text-orange-700' },
  { id: 'art', name: '艺术展览', icon: 'palette', color: 'text-purple-700' },
  { id: 'nature', name: '自然风光', icon: 'mountain', color: 'text-emerald-700' },
  { id: 'shopping', name: '购物休闲', icon: 'shopping-bag', color: 'text-pink-700' },
  { id: 'photo', name: '网红打卡', icon: 'camera', color: 'text-blue-700' },
  { id: 'nightlife', name: '都市夜游', icon: 'moon', color: 'text-indigo-700' },
  { id: 'relax', name: '疗愈放松', icon: 'coffee', color: 'text-teal-700' },
];

export const AGENTS: Agent[] = [
  {
    id: 'analyzer',
    name: '需求分析员',
    desc: '正在解读您的旅行偏好与个性...',
    duration: 2500,
    steps: [
      '解析兴趣标签...',
      '匹配旅行人格...',
      '生成偏好画像...'
    ]
  },
  {
    id: 'planner',
    name: '路线规划师',
    desc: '正在计算最优路径与交通方案...',
    duration: 3000,
    steps: [
      '检索目的地POI数据...',
      '计算距离矩阵...',
      '优化每日动线...',
      '规避拥堵时段...'
    ]
  },
  {
    id: 'designer',
    name: '行程设计师',
    desc: '正在编排每日活动与时间表...',
    duration: 3000,
    steps: [
      '设定每日主题...',
      '安排活动时段...',
      '添加餐饮推荐...',
      '插入休憩时间...'
    ]
  },
  {
    id: 'polisher',
    name: '文案润色师',
    desc: '正在优化描述与添加贴士...',
    duration: 2000,
    steps: [
      '润色景点介绍...',
      '生成避坑指南...',
      '添加美食攻略...',
      '最终核对检查...'
    ]
  }
];

export const MOCK_RESULT: ItineraryRecord = {
  id: 'itinerary-123',
  form: {
    city: '日本京都',
    startDate: '2024-04-01',
    endDate: '2024-04-03',
    days: 3,
    travelers: { count: 2, type: 'couple' },
    interests: ['历史古迹', '自然风光', '地道美食'],
    intensity: 'moderate',
    budget: 'comfortable',
    transport: 'public',
    requirements: []
  },
  summary: '这是一次穿越千年的古都之旅。我们在行程中平衡了静谧的禅意体验与热闹的市井生活，带您深度领略京都的四季之美与怀石料理的精致。',
  totalSpots: 12,
  totalBudget: 45000,
  createdAt: new Date().toISOString(),
  days: [
    {
      date: '2024-04-01',
      dayNumber: 1,
      theme: '古寺寻幽',
      totalDistance: 5.2,
      totalCost: 8000,
      activities: [
        {
          id: 'a1',
          time: '09:00',
          duration: 120,
          title: '清水寺 (Kiyomizu-dera)',
          description: '京都最古老的寺院，悬空的清水舞台可俯瞰京都全景，樱花季更是美不胜收。',
          category: '历史',
          tips: ['建议早起避开人流', '顺道参拜求姻缘的地主神社'],
          estimatedCost: 400
        },
        {
          id: 'a2',
          time: '12:00',
          duration: 90,
          title: '锦市场午餐',
          description: '被称为"京都的厨房"，这里有百余家店铺，汇集了各种京都特色小吃与渍物。',
          category: '美食',
          estimatedCost: 3000
        },
        {
          id: 'a3',
          time: '14:30',
          duration: 120,
          title: '伏见稻荷大社',
          description: '供奉稻荷神的神社，以其后山上连绵不绝的"千本鸟居"闻名世界。',
          category: '自然',
          tips: ['完整徒步需要2-3小时', '记得带水'],
          estimatedCost: 0
        }
      ]
    },
    {
      date: '2024-04-02',
      dayNumber: 2,
      theme: '岚山竹韵',
      totalDistance: 4.5,
      totalCost: 12000,
      activities: [
        {
          id: 'b1',
          time: '08:30',
          duration: 60,
          title: '岚山竹林小径',
          description: '漫步在参天竹林之中，聆听风吹过竹叶的沙沙声，感受极致的静谧。',
          category: '自然',
          tips: ['清晨光线最适合摄影'],
          estimatedCost: 0
        },
        {
          id: 'b2',
          time: '10:00',
          duration: 90,
          title: '天龙寺',
          description: '京都五山之首，其曹源池庭园是日本庭园设计的杰作，借景岚山，四季皆景。',
          category: '历史',
          estimatedCost: 500
        },
         {
          id: 'b3',
          time: '18:00',
          duration: 120,
          title: '先斗町怀石料理',
          description: '在鸭川畔的古老花街，享用一顿正宗的京料理，体验鸭川纳凉床的风情。',
          category: '美食',
          estimatedCost: 8000
        }
      ]
    }
  ]
};
