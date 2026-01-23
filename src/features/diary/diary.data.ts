export type PromptLayerKey = 'realism' | 'lighting' | 'tone' | 'composition' | 'texture' | 'layout';

export const templates = [
  { id: 'classic', name: '经典纪实', desc: '胶片 + 诗意', accent: '#D4A373' },
  { id: 'modern', name: '现代极简', desc: '留白 + 结构', accent: '#0F766E' },
  { id: 'heritage', name: '古风遗韵', desc: '墨色 + 典藏', accent: '#9A3412' },
  { id: 'film', name: '胶片质感', desc: '颗粒 + 温度', accent: '#6B7280' },
  { id: 'magazine', name: '杂志封面', desc: '标题 + 排版', accent: '#111827' },
  { id: 'documentary', name: '人文纪录', desc: '纪实 + 真实', accent: '#1F2937' },
  { id: 'architecture', name: '建筑笔记', desc: '结构 + 线条', accent: '#0F172A' },
  { id: 'cinema', name: '电影剧照', desc: '光影 + 叙事', accent: '#7C2D12' },
  { id: 'nature', name: '自然写意', desc: '山野 + 气息', accent: '#166534' },
];

export const styles = [
  '写实',
  '文艺',
  '复古',
  '清新',
  '温暖',
  '冷冽',
  '日系',
  '港风',
  '黑白',
  '胶片',
  '纪实',
  '梦幻',
  '古典',
  '街头',
  '自然',
];

export const themes = [
  '旧城街巷',
  '古建筑',
  '市井生活',
  '非遗技艺',
  '山水田园',
  '夜市灯火',
  '清晨薄雾',
  '湖边光影',
  '城市天际线',
  '雨后街景',
];

export const platforms = ['小红书', '微博', 'Instagram', 'TikTok', '朋友圈'];
export const sizes = ['2048x2048', '2048x3072', '3072x2048'];

export const baseTags = ['街巷', '古城', '人文', '美食', '市集', '建筑', '夜色', '山水', '手作', '故事'];

export const promptLayerGroups: Array<{ key: PromptLayerKey; title: string; options: string[] }> = [
  {
    key: 'realism',
    title: '写实程度',
    options: ['写实摄影', '轻度写意', '梦幻柔焦', '电影质感', '胶片颗粒', '水彩氛围', '国风插画'],
  },
  {
    key: 'lighting',
    title: '光线',
    options: ['自然光', '侧逆光', '夜景霓虹', '柔光窗影', '光斑穿透', '高反差'],
  },
  {
    key: 'tone',
    title: '色调',
    options: ['温暖', '冷调', '清新', '复古', '高级灰'],
  },
  {
    key: 'composition',
    title: '构图',
    options: ['黄金分割', '对称构图', '低角度', '俯视视角', '留白'],
  },
  {
    key: 'texture',
    title: '材质',
    options: ['粗粝', '细腻', '旧纸', '织物', '金属'],
  },
  {
    key: 'layout',
    title: '版式',
    options: ['三栏杂志', '大图极简', '标题叠字', '拼贴海报', '边框留白'],
  },
];

export type PosterExample = {
  id: string;
  name: string;
  city: string;
  theme: string;
  style: string;
  platform: string;
  prompt: string;
  keywords: string;
  layers: Record<PromptLayerKey, string[]>;
};

export const posterExamples: PosterExample[] = [
  {
    id: 'nanjing-jiming',
    name: '南京·鸡鸣寺',
    city: '南京',
    theme: '古建筑',
    style: '文艺',
    platform: '小红书',
    prompt: '春日鸡鸣寺，樱花盛开，古寺红墙与粉色花海交相辉映，游人如织，阳光透过花枝洒落',
    keywords: '鸡鸣寺, 樱花, 古寺, 红墙, 春日',
    layers: {
      realism: ['写实摄影'],
      lighting: ['自然光', '光斑穿透'],
      tone: ['温暖', '清新'],
      composition: ['黄金分割'],
      texture: ['细腻'],
      layout: ['大图极简'],
    },
  },
  {
    id: 'nanjing-xuanwu',
    name: '南京·玄武湖',
    city: '南京',
    theme: '湖边光影',
    style: '清新',
    platform: '小红书',
    prompt: '玄武湖畔，清晨薄雾笼罩湖面，远处城市天际线若隐若现，湖边垂柳轻拂，晨跑者的身影',
    keywords: '玄武湖, 晨雾, 城市天际线, 垂柳, 晨跑',
    layers: {
      realism: ['写实摄影', '轻度写意'],
      lighting: ['自然光', '柔光窗影'],
      tone: ['清新', '高级灰'],
      composition: ['留白', '黄金分割'],
      texture: ['细腻'],
      layout: ['大图极简'],
    },
  },
  {
    id: 'nanjing-xinjiekou',
    name: '南京·新街口',
    city: '南京',
    theme: '城市天际线',
    style: '现代',
    platform: '小红书',
    prompt: '新街口商圈夜景，高楼林立，霓虹闪烁，车流如织，现代都市的繁华与活力',
    keywords: '新街口, 夜景, 高楼, 霓虹, 车流',
    layers: {
      realism: ['写实摄影', '电影质感'],
      lighting: ['夜景霓虹', '高反差'],
      tone: ['冷调'],
      composition: ['俯视视角', '对称构图'],
      texture: ['金属'],
      layout: ['标题叠字'],
    },
  },
  {
    id: 'nanjing-1912',
    name: '南京·1912街区',
    city: '南京',
    theme: '旧城街巷',
    style: '复古',
    platform: '小红书',
    prompt: '1912街区，民国风情建筑，青砖灰瓦，梧桐树影婆娑，咖啡馆与酒吧的暖黄灯光',
    keywords: '1912街区, 民国建筑, 梧桐树, 咖啡馆, 夜色',
    layers: {
      realism: ['胶片颗粒'],
      lighting: ['柔光窗影', '侧逆光'],
      tone: ['温暖', '复古'],
      composition: ['低角度'],
      texture: ['旧纸', '粗粝'],
      layout: ['边框留白'],
    },
  },
  {
    id: 'nanjing-confucius',
    name: '南京·夫子庙',
    city: '南京',
    theme: '夜市灯火',
    style: '温暖',
    platform: '小红书',
    prompt: '夫子庙秦淮河畔，夜幕降临，红灯笼高挂，游船穿梭，倒影斑斓，小吃摊位热气腾腾',
    keywords: '夫子庙, 秦淮河, 红灯笼, 游船, 夜市',
    layers: {
      realism: ['写实摄影'],
      lighting: ['夜景霓虹', '光斑穿透'],
      tone: ['温暖'],
      composition: ['对称构图'],
      texture: ['细腻'],
      layout: ['拼贴海报'],
    },
  },
  {
    id: 'hangzhou-westlake',
    name: '杭州·西湖',
    city: '杭州',
    theme: '山水田园',
    style: '清新',
    platform: '小红书',
    prompt: '西湖断桥，雨后初晴，远山如黛，湖面波光粼粼，白堤柳树成荫，游人撑伞漫步',
    keywords: '西湖, 断桥, 雨后, 远山, 柳树',
    layers: {
      realism: ['水彩氛围', '轻度写意'],
      lighting: ['自然光', '柔光窗影'],
      tone: ['清新', '高级灰'],
      composition: ['黄金分割', '留白'],
      texture: ['细腻'],
      layout: ['大图极简'],
    },
  },
  {
    id: 'suzhou-garden',
    name: '苏州·园林',
    city: '苏州',
    theme: '古建筑',
    style: '古典',
    platform: '小红书',
    prompt: '拙政园，江南园林典范，假山流水，亭台楼阁，移步换景，窗棂光影交错',
    keywords: '拙政园, 江南园林, 假山, 亭台, 窗棂',
    layers: {
      realism: ['国风插画', '轻度写意'],
      lighting: ['柔光窗影', '侧逆光'],
      tone: ['高级灰', '复古'],
      composition: ['对称构图', '留白'],
      texture: ['旧纸'],
      layout: ['边框留白'],
    },
  },
  {
    id: 'shanghai-bund',
    name: '上海·外滩',
    city: '上海',
    theme: '城市天际线',
    style: '冷冽',
    platform: '小红书',
    prompt: '外滩夜景，黄浦江两岸灯火辉煌，东方明珠塔与陆家嘴高楼群，现代与历史的对话',
    keywords: '外滩, 黄浦江, 东方明珠, 陆家嘴, 夜景',
    layers: {
      realism: ['写实摄影', '电影质感'],
      lighting: ['夜景霓虹', '高反差'],
      tone: ['冷调'],
      composition: ['对称构图', '俯视视角'],
      texture: ['金属'],
      layout: ['三栏杂志'],
    },
  },
];
