export type StoryPoi = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
};

export type StoryScene = {
  id: string;
  title: string;
  timeOfDay?: string;
  poi: StoryPoi;
  shot: string;
  narration: string;
  task: string;
  tip?: string;
  durationMinutes?: number;
};

export type StoryArc = {
  id: string;
  city: string;
  theme: string;
  title: string;
  logline: string;
  summary?: string;
  scenes: StoryScene[];
};

export const storyMockArc: StoryArc = {
  id: 'arc_mock_beijing_01',
  city: '北京',
  theme: '古城街巷',
  title: '城门之下',
  logline: '在一天之内，沿着老城中轴线完成一部三幕式城市短片。',
  summary: '从城门到公园，以人文与光影串联历史与当下。',
  scenes: [
    {
      id: 'scene_1',
      title: '晨光开场',
      timeOfDay: '早晨',
      poi: {
        id: 'poi_1',
        name: '天安门广场',
        lng: 116.397428,
        lat: 39.90923,
        address: '东城区',
      },
      shot: '远景俯拍+广角推进，突出开阔感与秩序感。',
      narration: '清晨的广场像一张空白画布，等着被城市的声音填满。',
      task: '拍摄1张“空旷广场+晨光”的开场镜头。',
      tip: '避免正午强光，建议在日出后1小时内完成。',
      durationMinutes: 35,
    },
    {
      id: 'scene_2',
      title: '街巷过渡',
      timeOfDay: '上午',
      poi: {
        id: 'poi_2',
        name: '前门大街',
        lng: 116.404136,
        lat: 39.899428,
        address: '东城区',
      },
      shot: '中景跟拍+细节特写，记录人流与招牌。',
      narration: '老街的烟火气让历史有了温度与气味。',
      task: '拍下“牌匾字体+行人剪影”的双层画面。',
      tip: '尝试对焦在招牌上，让人群做自然前景。',
      durationMinutes: 45,
    },
    {
      id: 'scene_3',
      title: '高点收束',
      timeOfDay: '傍晚',
      poi: {
        id: 'poi_3',
        name: '景山公园',
        lng: 116.397498,
        lat: 39.926874,
        address: '西城区',
      },
      shot: '远景定帧+慢推，收束中轴线全景。',
      narration: '夕阳把城市染成温柔的颜色，旅程在高处落幕。',
      task: '完成1张“中轴线全景+落日”的收束镜头。',
      tip: '日落前15分钟是最佳光线窗口。',
      durationMinutes: 40,
    },
  ],
};
