import { randomUUID } from 'node:crypto';

export type ItineraryForm = {
  city: string;
  startDate: string;
  endDate: string;
  days: number;
  travelers: {
    count: number;
    type: 'solo' | 'couple' | 'family' | 'friends';
  };
  interests: string[];
  intensity: 'relaxed' | 'moderate' | 'packed';
  budget: 'economy' | 'comfortable' | 'luxury';
  transport: 'walking' | 'public' | 'taxi' | 'driving';
  requirements: string[];
  mustVisit?: string[];
};

export type ItineraryActivity = {
  id: string;
  time: string;
  duration: number;
  title: string;
  description: string;
  category: string;
  poi?: {
    id: string;
    name: string;
    lng: number;
    lat: number;
  };
  tips?: string[];
  estimatedCost?: number;
};

export type ItineraryDay = {
  date: string;
  dayNumber: number;
  theme: string;
  activities: ItineraryActivity[];
  totalDistance?: number;
  totalCost?: number;
};

export type GeneratedItinerary = {
  days: ItineraryDay[];
  summary: string;
  totalSpots: number;
  totalBudget: number;
};

/**
 * Activity templates based on interests
 */
const ACTIVITY_TEMPLATES: Record<string, { titles: string[]; descriptions: string[]; tips: string[][] }> = {
  '历史古迹': {
    titles: ['古城墙遗址', '历史博物馆', '古建筑群', '文化遗产公园', '古寺庙'],
    descriptions: [
      '探索千年历史遗迹，感受古代文明的辉煌',
      '深入了解当地历史文化，欣赏珍贵文物',
      '漫步古建筑群，领略传统建筑艺术',
      '参观世界文化遗产，体验历史厚重感',
      '在古老寺庙中感受宁静与禅意'
    ],
    tips: [
      ['建议请导游讲解', '避开周末高峰'],
      ['提前预约门票', '携带身份证件'],
      ['穿舒适的鞋子', '注意保护文物'],
      ['早上光线最佳', '适合摄影'],
      ['保持安静', '尊重宗教习俗']
    ]
  },
  '地道美食': {
    titles: ['特色小吃街', '传统餐厅', '美食市场', '网红餐厅', '老字号'],
    descriptions: [
      '品尝地道小吃，体验当地饮食文化',
      '享用传统美食，感受正宗风味',
      '逛美食市场，发现隐藏美味',
      '打卡人气餐厅，品味创意料理',
      '探访百年老店，传承经典味道'
    ],
    tips: [
      ['避开用餐高峰', '注意食品卫生'],
      ['提前预约座位', '询问推荐菜品'],
      ['带现金备用', '尝试当地特色'],
      ['可能需要排队', '拍照前询问'],
      ['尊重传统', '适量点餐']
    ]
  },
  '艺术展览': {
    titles: ['当代艺术馆', '美术馆', '艺术区', '画廊街', '创意园区'],
    descriptions: [
      '欣赏当代艺术作品，感受创意灵感',
      '参观经典艺术展览，提升审美品味',
      '漫步艺术区，发现独立艺术家作品',
      '探索画廊，收藏心仪艺术品',
      '体验创意空间，激发艺术灵感'
    ],
    tips: [
      ['查看展览时间', '可能需要预约'],
      ['保持安静', '禁止触摸作品'],
      ['了解艺术家背景', '参加导览'],
      ['注意拍照规定', '尊重版权'],
      ['留出充足时间', '细细品味']
    ]
  },
  '自然风光': {
    titles: ['山景公园', '湖畔步道', '森林保护区', '观景台', '自然保护区'],
    descriptions: [
      '登高望远，欣赏壮丽山景',
      '漫步湖畔，享受宁静时光',
      '徒步森林，呼吸新鲜空气',
      '登上观景台，俯瞰城市全景',
      '探索自然保护区，观察野生动植物'
    ],
    tips: [
      ['穿登山鞋', '带足够的水'],
      ['注意天气变化', '做好防晒'],
      ['遵守步道规则', '不要喂食动物'],
      ['最佳观景时间', '携带望远镜'],
      ['保护环境', '不留垃圾']
    ]
  },
  '购物休闲': {
    titles: ['购物中心', '特色商业街', '免税店', '设计师店铺', '手工艺品市场'],
    descriptions: [
      '逛大型购物中心，享受购物乐趣',
      '漫步特色商业街，淘宝特色商品',
      '免税店购物，享受优惠价格',
      '探访设计师店铺，发现独特设计',
      '选购手工艺品，带回特色纪念品'
    ],
    tips: [
      ['关注促销活动', '办理会员卡'],
      ['货比三家', '注意退换货政策'],
      ['携带护照', '了解免税额度'],
      ['提前预约', '可能需要定制'],
      ['讨价还价', '检查商品质量']
    ]
  },
  '网红打卡': {
    titles: ['网红景点', '打卡地标', '特色建筑', '艺术装置', '观景平台'],
    descriptions: [
      '打卡热门景点，拍摄ins风照片',
      '在地标建筑前留影纪念',
      '探访特色建筑，记录独特设计',
      '与艺术装置互动，创作趣味照片',
      '登上观景平台，拍摄城市美景'
    ],
    tips: [
      ['避开人流高峰', '早起拍照'],
      ['了解最佳拍摄角度', '带好设备'],
      ['注意安全', '遵守规定'],
      ['尝试不同角度', '发挥创意'],
      ['黄金时段拍摄', '注意构图']
    ]
  },
  '都市夜游': {
    titles: ['夜景观赏', '夜市', '酒吧街', '夜游船', '灯光秀'],
    descriptions: [
      '欣赏璀璨夜景，感受都市魅力',
      '逛热闹夜市，品尝夜宵美食',
      '体验酒吧文化，享受夜生活',
      '乘坐夜游船，从水上看城市',
      '观看灯光秀，感受视觉盛宴'
    ],
    tips: [
      ['注意安全', '结伴同行'],
      ['带现金', '注意个人物品'],
      ['适量饮酒', '预约出租车'],
      ['提前购票', '注意开船时间'],
      ['查看演出时间', '提前占位']
    ]
  },
  '疗愈放松': {
    titles: ['温泉度假村', '水疗中心', '瑜伽馆', '茶室', '冥想中心'],
    descriptions: [
      '泡温泉放松身心，享受宁静时光',
      '体验专业水疗，舒缓旅途疲劳',
      '参加瑜伽课程，调整身心状态',
      '品茶静心，感受慢生活节奏',
      '冥想放松，找回内心平静'
    ],
    tips: [
      ['提前预约', '了解温泉礼仪'],
      ['选择合适项目', '告知身体状况'],
      ['穿舒适服装', '提前到达'],
      ['保持安静', '细细品味'],
      ['关闭手机', '全身心投入']
    ]
  }
};

/**
 * Get activity count per day based on intensity
 */
const getActivitiesPerDay = (intensity: ItineraryForm['intensity']): number => {
  switch (intensity) {
    case 'relaxed':
      return 3;
    case 'moderate':
      return 4;
    case 'packed':
      return 5;
    default:
      return 4;
  }
};

/**
 * Get base cost per activity based on budget
 */
const getBaseCost = (budget: ItineraryForm['budget']): number => {
  switch (budget) {
    case 'economy':
      return 50;
    case 'comfortable':
      return 150;
    case 'luxury':
      return 400;
    default:
      return 150;
  }
};

/**
 * Get max distance per day based on transport mode
 */
const getMaxDistance = (transport: ItineraryForm['transport']): number => {
  switch (transport) {
    case 'walking':
      return 5;
    case 'public':
      return 15;
    case 'taxi':
    case 'driving':
      return 30;
    default:
      return 15;
  }
};

/**
 * Generate activity title and description based on interest
 */
const generateActivityContent = (interest: string, index: number) => {
  const template = ACTIVITY_TEMPLATES[interest] || ACTIVITY_TEMPLATES['历史古迹'];
  const titleIndex = index % template.titles.length;
  const descIndex = index % template.descriptions.length;
  const tipsIndex = index % template.tips.length;

  return {
    title: template.titles[titleIndex],
    description: template.descriptions[descIndex],
    tips: template.tips[tipsIndex]
  };
};

/**
 * Generate activities for a day
 */
const generateDayActivities = (
  form: ItineraryForm,
  dayNumber: number,
  activitiesCount: number,
  baseCost: number
): ItineraryActivity[] => {
  const activities: ItineraryActivity[] = [];
  let currentTime = 9; // Start at 9:00 AM

  for (let i = 0; i < activitiesCount; i++) {
    // Select interest for this activity (rotate through interests)
    const interestIndex = (dayNumber - 1 + i) % form.interests.length;
    const interest = form.interests[interestIndex];

    // Generate time
    const hour = Math.floor(currentTime);
    const minute = Math.round((currentTime % 1) * 60);
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Generate duration (90-150 minutes for activities, 60-90 for meals)
    const isMealTime = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19);
    const duration = isMealTime ? 60 + Math.floor(Math.random() * 30) : 90 + Math.floor(Math.random() * 60);

    // Generate content based on interest
    const content = generateActivityContent(interest, i);

    // Calculate cost with some variation
    const costVariation = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x
    const estimatedCost = Math.round(baseCost * costVariation);

    // Generate POI coordinates (mock data around a central point)
    const baseLng = 116.4 + Math.random() * 0.2 - 0.1;
    const baseLat = 39.9 + Math.random() * 0.2 - 0.1;

    activities.push({
      id: randomUUID(),
      time: timeStr,
      duration,
      title: `${content.title}`,
      description: content.description,
      category: interest,
      poi: {
        id: `poi_${dayNumber}_${i}`,
        name: `${form.city} ${content.title}`,
        lng: baseLng,
        lat: baseLat,
      },
      tips: content.tips,
      estimatedCost,
    });

    // Move to next time slot (activity duration + break)
    currentTime += duration / 60 + 0.5; // Add 30 min break
  }

  return activities;
};

/**
 * Generate theme for a day based on interests
 */
const generateDayTheme = (form: ItineraryForm, dayNumber: number): string => {
  const themes = [
    '探索之旅',
    '文化体验',
    '美食寻味',
    '自然漫步',
    '艺术熏陶',
    '休闲时光',
    '深度游览',
    '特色体验'
  ];

  // Use primary interest for theme
  const primaryInterest = form.interests[(dayNumber - 1) % form.interests.length];
  
  if (primaryInterest.includes('历史')) return '古韵寻踪';
  if (primaryInterest.includes('美食')) return '美食探索';
  if (primaryInterest.includes('艺术')) return '艺术之旅';
  if (primaryInterest.includes('自然')) return '自然风光';
  if (primaryInterest.includes('购物')) return '购物休闲';
  if (primaryInterest.includes('网红')) return '打卡之旅';
  if (primaryInterest.includes('夜游')) return '夜色魅力';
  if (primaryInterest.includes('放松')) return '疗愈时光';

  return themes[(dayNumber - 1) % themes.length];
};

/**
 * Generate summary text for the itinerary
 */
const generateSummary = (form: ItineraryForm): string => {
  const travelStyle = form.travelers.type === 'solo' 
    ? '独自旅行' 
    : form.travelers.type === 'couple' 
    ? '情侣出行' 
    : form.travelers.type === 'family' 
    ? '家庭出游' 
    : '朋友结伴';

  const intensityDesc = form.intensity === 'relaxed' 
    ? '轻松舒适，留出充足休息时间' 
    : form.intensity === 'moderate' 
    ? '节奏适中，动静结合' 
    : '内容丰富，充实紧凑';

  const budgetDesc = form.budget === 'economy' 
    ? '经济实惠，性价比高' 
    : form.budget === 'comfortable' 
    ? '舒适合理，品质保证' 
    : '品质优选，尊享体验';

  const interestsText = form.interests.slice(0, 3).join('、');

  return `这是一次精心设计的${form.days}天${form.city}之旅，专为${travelStyle}打造。行程涵盖${interestsText}等主题，${intensityDesc}。预算${budgetDesc}，让您在旅途中既能深度体验当地文化，又能享受舒适的旅行节奏。`;
};

/**
 * Generate itinerary based on form data (Mock version)
 * 
 * This function generates a dynamic itinerary based on user preferences:
 * - Creates the correct number of days based on form.days
 * - Generates activities based on selected interests
 * - Calculates costs based on budget level
 * - Determines activity count based on intensity
 * - Generates a comprehensive summary
 * 
 * @param form - The itinerary form data from the user
 * @returns Generated itinerary with days, summary, and totals
 */
export const generateItinerary = async (form: ItineraryForm): Promise<GeneratedItinerary> => {
  // Simulate AI generation delay (matching agent flow duration)
  await new Promise((resolve) => setTimeout(resolve, 10500));

  const days: ItineraryDay[] = [];
  const startDate = new Date(form.startDate);

  // Determine parameters based on form data
  const activitiesPerDay = getActivitiesPerDay(form.intensity);
  const baseCost = getBaseCost(form.budget);
  const maxDistance = getMaxDistance(form.transport);

  // Generate each day
  for (let i = 0; i < form.days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayNumber = i + 1;
    const theme = generateDayTheme(form, dayNumber);
    const activities = generateDayActivities(form, dayNumber, activitiesPerDay, baseCost);

    // Calculate day totals
    const totalCost = activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
    const totalDistance = Math.round((3 + Math.random() * (maxDistance - 3)) * 10) / 10;

    days.push({
      date: dateStr,
      dayNumber,
      theme,
      activities,
      totalDistance,
      totalCost,
    });
  }

  // Calculate overall totals
  const totalSpots = days.reduce((sum, d) => sum + d.activities.length, 0);
  const totalBudget = days.reduce((sum, d) => sum + (d.totalCost || 0), 0);
  const summary = generateSummary(form);

  return {
    days,
    summary,
    totalSpots,
    totalBudget,
  };
};
