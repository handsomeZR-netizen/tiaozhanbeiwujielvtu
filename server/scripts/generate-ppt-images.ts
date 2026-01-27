import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用新的 API Key（仅用于 PPT 图片生成）
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const PPT_ARK_API_KEY = '7041e3a8-18c7-4949-8641-7bbd82cc17ab';
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

// 全局负面提示词
const NEGATIVE_PROMPT = '不要文字，不要水印，不要logo，不要二维码，不要畸形手指，不要多余肢体，不要模糊，不要低清，不要过曝，不要血腥暴力，不要政治敏感标识';

type PromptConfig = {
  id: string;
  filename: string;
  prompt: string;
  description: string;
};

// PPT 图片提示词配置
const pptImagePrompts: PromptConfig[] = [
  // 第1页 - 封面
  {
    id: 'cover-01',
    filename: 'cover-01.jpg',
    prompt: '16:9，新中式科技风，夜幕下的南京城市天际线与秦淮河水面反光，古建筑飞檐与现代玻璃高楼交叠融合，空中有细微的数据流光线，纸纹质感背景，电影级光影，留白充足，无文字无logo',
    description: '封面 - 南京城市天际线（版本一）',
  },
  {
    id: 'cover-02',
    filename: 'cover-02.jpg',
    prompt: '16:9，水墨渲染风格，南京城墙剪影与现代建筑轮廓交织，前景是传统灯笼与科技光点漂浮，远景秦淮河倒影，色调以墨色渐变到科技蓝，宣纸质感，意境深远，留白，无文字无logo',
    description: '封面 - 南京城市天际线（版本二）',
  },

  // 第2页 - 项目背景
  {
    id: 'background-01',
    filename: 'background-01.jpg',
    prompt: '16:9，极简抽象插画，许多漂浮的旅行APP界面碎片、地图碎片、文字卡片碎片在空中旋转，中心是一条亮起的"路径线"将碎片重新串联，配色墨黑+纸白+朱砂红+科技蓝，留白，无文字无logo',
    description: '项目背景 - 信息碎片化（版本一）',
  },
  {
    id: 'background-02',
    filename: 'background-02.jpg',
    prompt: '16:9，扁平化信息图风格，散落的拼图块代表不同平台（用颜色区分），中央一个发光的连接节点向外延伸线条将拼图连接，整体呈现从混乱到有序的视觉动线，现代简约，留白，无文字无logo',
    description: '项目背景 - 信息碎片化（版本二）',
  },

  // 第3页 - 痛点1
  {
    id: 'pain-01',
    filename: 'pain-01.jpg',
    prompt: '16:9，写实但略带插画质感，一位游客站在路口，周围漂浮多块手机屏幕（地图/短视频/攻略/票务/翻译），游客略显困惑，远处是温暖的中国城市街景，强调"信息过载"，留白，无文字无logo',
    description: '痛点1 - 游客在多屏中迷失（版本一）',
  },
  {
    id: 'pain-02',
    filename: 'pain-02.jpg',
    prompt: '16:9，概念插画风，俯视视角，一个人物剪影站在多条分叉路口中央，每条路上漂浮着不同的应用图标（抽象几何形状代替），路面有发光的导航线但相互交错，整体表达选择困难，配色温暖但略带迷茫感，留白，无文字无logo',
    description: '痛点1 - 游客在多屏中迷失（版本二）',
  },

  // 第4页 - 痛点2
  {
    id: 'digital-gap-01',
    filename: 'digital-gap-01.jpg',
    prompt: '16:9，信息图风格插画，机场到城市的动线，包含地铁、景区、博物馆、餐厅等节点，每个节点上方有小型数字符号（二维码、地图针、翻译气泡），用红色标出若干"障碍点"，整体积极、明亮、无文字无logo',
    description: '痛点2 - 入境服务链路（版本一）',
  },
  {
    id: 'digital-gap-02',
    filename: 'digital-gap-02.jpg',
    prompt: '16:9，等距视角插画，旅行者从机场出发的立体路径图，途经交通站、景点、餐饮等立体小场景，部分节点有警示色标记表示障碍，整体色调明快但对比明显，现代扁平风，留白，无文字无logo',
    description: '痛点2 - 入境服务链路（版本二）',
  },

  // 第5页 - 政策与市场
  {
    id: 'policy-01',
    filename: 'policy-01.jpg',
    prompt: '16:9，新中式科技风，纸纹背景上浮现电路纹理与传统纹样（云纹、回纹）叠加，中央是一枚抽象的"文化印章"与"芯片"融合体，光线从中心向外扩散，庄重、正能量、无文字无logo',
    description: '政策与市场 - 文化+科技（版本一）',
  },
  {
    id: 'policy-02',
    filename: 'policy-02.jpg',
    prompt: '16:9，双重曝光风格，传统建筑剪影与数字网络线条融合，前景是书法笔触与代码流光交织，背景渐变从墨色到科技蓝，象征传统与现代融合，氛围庄重而富有未来感，留白，无文字无logo',
    description: '政策与市场 - 文化+科技（版本二）',
  },

  // 第6页 - 区域优势
  {
    id: 'region-01',
    filename: 'region-01.jpg',
    prompt: '16:9，拼贴风海报，南京夫子庙牌坊、秦淮河、南京博物院、城墙、中山陵元素以现代拼贴方式组合，配色纸白+朱砂红+墨黑，留白，无文字无logo',
    description: '区域优势 - 南京文化地标拼贴（版本一）',
  },
  {
    id: 'region-02',
    filename: 'region-02.jpg',
    prompt: '16:9，几何抽象风格，南京地标建筑用简化的几何形状表达（圆形代表中山陵、矩形代表城墙、曲线代表秦淮河），层叠排列形成城市天际线，配色国潮风，现代感强，留白，无文字无logo',
    description: '区域优势 - 南京文化地标拼贴（版本二）',
  },

  // 第7页 - 解决方案总览
  {
    id: 'solution-01',
    filename: 'solution-01.jpg',
    prompt: '16:9，抽象科技可视化，一个由五段光环组成的闭环，分别对应发现、理解、规划、创作、传播（用图形区分而非文字），中心是温暖的中国城市剪影，色彩从冷到暖渐变，留白，无文字无logo',
    description: '解决方案总览 - 闭环系统（版本一）',
  },
  {
    id: 'solution-02',
    filename: 'solution-02.jpg',
    prompt: '16:9，流程图艺术化表达，五个发光节点围成圆形，节点间用流动的光带连接形成循环，每个节点用不同颜色和图标样式区分，中央是抽象的地图与文化符号融合，整体科技感与人文感并存，留白，无文字无logo',
    description: '解决方案总览 - 闭环系统（版本二）',
  },

  // 第8页 - 核心技术创新
  {
    id: 'tech-01',
    filename: 'tech-01.jpg',
    prompt: '16:9，科技网络可视化，中心一个发光的核心节点，四个卫星节点围绕，节点之间有细线连接，整体呈织网结构，配色蓝+紫+朱砂点缀，背景纸纹轻微，留白，无文字无logo',
    description: '核心技术创新 - 多智能体网络（版本一）',
  },
  {
    id: 'tech-02',
    filename: 'tech-02.jpg',
    prompt: '16:9，神经网络风格插画，中央一个大脑形状的核心，向外延伸四条主要神经通路连接到不同功能区域（用抽象图形表示），整体像是智能系统的思维导图，配色渐变从深蓝到紫红，科技感强，留白，无文字无logo',
    description: '核心技术创新 - 多智能体网络（版本二）',
  },

  // 第9页 - 地图图鉴
  {
    id: 'atlas-01',
    filename: 'atlas-01.jpg',
    prompt: '16:9，写实插画风，南京老城街巷漫步路线俯视构图，地图针与路线线条以半透明HUD叠加在真实街景上，温暖人文、轻科技感，留白，无文字无logo',
    description: '地图图鉴 - 南京城市漫游路线（版本一）',
  },
  {
    id: 'atlas-02',
    filename: 'atlas-02.jpg',
    prompt: '16:9，手绘地图风格，南京城市街道以艺术化手绘方式呈现，关键地标用小插画标注，路线用虚线和箭头引导，整体像是精美的旅行手账插图，配色温暖复古，留白，无文字无logo',
    description: '地图图鉴 - 南京城市漫游路线（版本二）',
  },

  // 第10页 - 片场剧本（三幕）
  {
    id: 'story-morning',
    filename: 'story-morning.jpg',
    prompt: '16:9，电影感写实，南京城墙晨光，薄雾，路面微湿，画面有轻微HUD镜头框线但无文字，留白',
    description: '片场剧本 - 清晨版（版本一）',
  },
  {
    id: 'story-morning-alt',
    filename: 'story-morning-alt.jpg',
    prompt: '16:9，水彩风格插画，清晨的南京古城门，晨雾弥漫，远处城墙轮廓若隐若现，前景有早起的行人剪影，色调柔和清新，留白，无文字无logo',
    description: '片场剧本 - 清晨版（版本二）',
  },
  {
    id: 'story-afternoon',
    filename: 'story-afternoon.jpg',
    prompt: '16:9，电影感写实，南京博物院外景或现代建筑与人群，阳光斑驳，留白，无文字无logo',
    description: '片场剧本 - 午后版（版本一）',
  },
  {
    id: 'story-afternoon-alt',
    filename: 'story-afternoon-alt.jpg',
    prompt: '16:9，明亮插画风，南京现代街区与传统建筑并存，午后阳光透过梧桐树洒下光斑，游客在街道漫步，色彩饱满温暖，生活气息浓厚，留白，无文字无logo',
    description: '片场剧本 - 午后版（版本二）',
  },
  {
    id: 'story-night',
    filename: 'story-night.jpg',
    prompt: '16:9，电影感写实，秦淮河夜景灯火与倒影，氛围温暖，留白，无文字无logo',
    description: '片场剧本 - 夜晚版（版本一）',
  },
  {
    id: 'story-night-alt',
    filename: 'story-night-alt.jpg',
    prompt: '16:9，夜景插画风，秦淮河两岸灯笼高挂，河面倒影如画，远处现代建筑灯光点缀，整体呈现古今交融的夜色之美，配色温暖浪漫，留白，无文字无logo',
    description: '片场剧本 - 夜晚版（版本二）',
  },

  // 第11页 - 文化识别
  {
    id: 'studio-01',
    filename: 'studio-01.jpg',
    prompt: '16:9，微距写实，中国传统工艺细节特写（如雕花木窗、青花瓷纹样、织锦纹理），旁边叠加淡淡科技扫描光束效果，干净背景，留白，无文字无logo',
    description: '文化识别 - 非遗/建筑细节（版本一）',
  },
  {
    id: 'studio-02',
    filename: 'studio-02.jpg',
    prompt: '16:9，特写镜头风格，传统建筑飞檐斗拱细节或石雕纹样，周围有AR识别框线和信息点标注（仅图形不含文字），背景虚化突出主体，科技与传统对话感，留白，无文字无logo',
    description: '文化识别 - 非遗/建筑细节（版本二）',
  },

  // 第12页 - 行程规划
  {
    id: 'itinerary-01',
    filename: 'itinerary-01.jpg',
    prompt: '16:9，手账风插画，一页旅行计划板，包含地图小块、时间轴、景点小插画、交通图标（不写字），配色纸白+朱砂红+蓝色点缀，留白，无文字无logo',
    description: '行程规划 - 旅行手账式日程（版本一）',
  },
  {
    id: 'itinerary-02',
    filename: 'itinerary-02.jpg',
    prompt: '16:9，数字日历风格，立体卡片式日程排列，每张卡片代表一天行程（用图标和色块表示），卡片间用连接线串联，整体像是智能规划看板，现代简约，配色清新，留白，无文字无logo',
    description: '行程规划 - 旅行手账式日程（版本二）',
  },

  // 第13页 - 海报工作台（三种风格）
  {
    id: 'diary-guochao',
    filename: 'diary-guochao.jpg',
    prompt: '16:9，国潮海报插画风，南京元素（城墙、秦淮灯影、梅花）组合，色彩饱满，留白，无文字无logo',
    description: '海报工作台 - 国潮风格（版本一）',
  },
  {
    id: 'diary-guochao-alt',
    filename: 'diary-guochao-alt.jpg',
    prompt: '16:9，新国风插画，传统印章纹样与南京地标剪影结合，配色使用传统色（赭石、靛蓝、朱砂），构图对称庄重，现代感与传统美学融合，留白，无文字无logo',
    description: '海报工作台 - 国潮风格（版本二）',
  },
  {
    id: 'diary-cinema',
    filename: 'diary-cinema.jpg',
    prompt: '16:9，电影海报质感，南京夜景街道、霓虹与雨后反光，构图有主视觉留白，无文字无logo',
    description: '海报工作台 - 电影感风格（版本一）',
  },
  {
    id: 'diary-cinema-alt',
    filename: 'diary-cinema-alt.jpg',
    prompt: '16:9，赛博朋克风格，南京现代建筑与古建筑交错，夜晚霓虹灯光与传统灯笼光影对比，雨后地面反光强烈，色调冷暖对比，视觉冲击力强，留白，无文字无logo',
    description: '海报工作台 - 电影感风格（版本二）',
  },
  {
    id: 'diary-minimal',
    filename: 'diary-minimal.jpg',
    prompt: '16:9，极简平面设计风，几何形状抽象出南京城市轮廓与河流线条，纸纹背景，留白，无文字无logo',
    description: '海报工作台 - 极简现代风格（版本一）',
  },
  {
    id: 'diary-minimal-alt',
    filename: 'diary-minimal-alt.jpg',
    prompt: '16:9，包豪斯风格海报，用基础几何图形（圆、方、三角）构建南京城市符号，线条简洁有力，配色限定三色（黑白+一个主题色），极致简约，留白，无文字无logo',
    description: '海报工作台 - 极简现代风格（版本二）',
  },

  // 第14页 - 完整闭环演示
  {
    id: 'flow-01',
    filename: 'flow-01.jpg',
    prompt: '16:9，流程叙事插画，一条发光路径从机场延伸到城市景点再到手机分享界面（界面只用抽象块不写字），整体温暖、积极、科技感轻，留白，无文字无logo',
    description: '完整闭环演示 - 从地图到分享（版本一）',
  },
  {
    id: 'flow-02',
    filename: 'flow-02.jpg',
    prompt: '16:9，信息流动可视化，从左到右的时间线，起点是飞机图标，中间经过多个城市场景节点（用小插画表示），终点是社交分享符号，整条路径有数据流光效，表达完整体验链路，留白，无文字无logo',
    description: '完整闭环演示 - 从地图到分享（版本二）',
  },

  // 第15页 - 技术架构
  {
    id: 'arch-01',
    filename: 'arch-01.jpg',
    prompt: '16:9，极简科技底图，半透明方块与连线构成系统网络，背景纸纹轻微，配色蓝+灰+朱砂点缀，留白，无文字无logo',
    description: '技术架构 - 系统架构示意（版本一）',
  },
  {
    id: 'arch-02',
    filename: 'arch-02.jpg',
    prompt: '16:9，电路板美学，抽象的电路走线与芯片布局，融入中式纹样元素（云纹、回纹），整体呈现技术架构的秩序美感，配色科技蓝+金属灰+暖色点缀，留白，无文字无logo',
    description: '技术架构 - 系统架构示意（版本二）',
  },

  // 第16页 - 技术创新点
  {
    id: 'innovation-01',
    filename: 'innovation-01.jpg',
    prompt: '16:9，抽象信息图，五边形结构发光，五个节点以不同颜色标识，中心汇聚，背景纸纹+细微电路纹理，留白，无文字无logo',
    description: '技术创新点 - 创新五边形（版本一）',
  },
  {
    id: 'innovation-02',
    filename: 'innovation-02.jpg',
    prompt: '16:9，雷达图艺术化，五个维度向外辐射形成星形结构，每个维度端点有发光效果和图标标识，中心区域填充渐变色，整体像是能力评估可视化，科技感强，留白，无文字无logo',
    description: '技术创新点 - 创新五边形（版本二）',
  },

  // 第17页 - 竞品分析
  {
    id: 'compete-01',
    filename: 'compete-01.jpg',
    prompt: '16:9，极简坐标系背景图（无文字），左下到右上渐变，四个模糊圆点代表竞品分布，右上角一个亮点代表"我们"，配色蓝+朱砂，留白，无文字无logo',
    description: '竞品分析 - 差异化定位坐标（版本一）',
  },
  {
    id: 'compete-02',
    filename: 'compete-02.jpg',
    prompt: '16:9，战略定位图风格，抽象的二维空间，用不同大小和颜色的圆形代表不同竞品位置，我方用特殊形状（如星形）和高亮色标识在优势区域，整体简洁专业，留白，无文字无logo',
    description: '竞品分析 - 差异化定位坐标（版本二）',
  },

  // 第18页 - 商业模式
  {
    id: 'business-01',
    filename: 'business-01.jpg',
    prompt: '16:9，城市运营中台概念插画，城市上方悬浮一个半透明控制面板（仅图形不写字），下方连接景区、博物馆、交通、活动等节点，整体积极、现代、留白，无文字无logo',
    description: '商业模式 - 城市文旅中台（版本一）',
  },
  {
    id: 'business-02',
    filename: 'business-02.jpg',
    prompt: '16:9，智慧城市可视化，立体城市模型上方有数据流和连接线，各个文旅节点用发光标记，中央有一个指挥中枢图形，整体呈现智能管理系统概念，科技感与城市感结合，留白，无文字无logo',
    description: '商业模式 - 城市文旅中台（版本二）',
  },

  // 第19页 - 财务分析
  {
    id: 'finance-01',
    filename: 'finance-01.jpg',
    prompt: '16:9，极简科技风抽象图，向上增长的光带曲线与柱状几何体（无数字无文字），配色蓝+金+朱砂点缀，留白，无文字无logo',
    description: '财务分析 - 财务增长曲线（版本一）',
  },
  {
    id: 'finance-02',
    filename: 'finance-02.jpg',
    prompt: '16:9，数据增长可视化艺术，抽象的阶梯式上升结构，每层用不同透明度和颜色表示，配合向上的箭头和光效，象征持续增长，配色渐变从冷色到暖色，留白，无文字无logo',
    description: '财务分析 - 财务增长曲线（版本二）',
  },

  // 第20页 - 团队与未来
  {
    id: 'future-01',
    filename: 'future-01.jpg',
    prompt: '16:9，温暖写实，来自不同国家的青年在南京文化场景（博物馆/古街/河畔）交流微笑，画面有轻微科技光点象征连接与传播，积极正能量，留白，无文字无logo',
    description: '团队与未来 - 世界青年文化交流（版本一）',
  },
  {
    id: 'future-02',
    filename: 'future-02.jpg',
    prompt: '16:9，插画风格，多元文化背景的人物剪影围成圆形，中央是南京城市地标的抽象图形，人物间有连接线和光点，象征文化交流与连接，配色温暖多彩，充满希望感，留白，无文字无logo',
    description: '团队与未来 - 世界青年文化交流（版本二）',
  },
];

// 生成图片的核心函数
async function generateImage(prompt: string, size: string = '2K') {
  // 将负面提示词附加到每个提示词后面
  const fullPrompt = `${prompt}。${NEGATIVE_PROMPT}`;
  
  const response = await fetch(`${ARK_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PPT_ARK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt: fullPrompt,
      response_format: 'url',
      size,
      sequential_image_generation: 'disabled',
      watermark: false, // 明确设置为 false
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// 下载并处理图片
async function downloadAndProcess(url: string, filepath: string): Promise<void> {
  const imageRes = await fetch(url);
  if (!imageRes.ok) {
    throw new Error(`Failed to download image: ${imageRes.status}`);
  }
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  await sharp(buffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'cover',
      position: 'attention',
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(filepath);
}

// 生成单张图片
async function generateSingleImage(config: PromptConfig, outputDir: string) {
  console.log(`\n生成图片: ${config.id}`);
  console.log(`描述: ${config.description}`);
  console.log(`提示词: ${config.prompt}`);

  const result = await generateImage(config.prompt, '2K');
  const imageUrl = result?.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('API 返回数据格式错误（未包含 URL）');
  }

  const filepath = path.join(outputDir, config.filename);
  await downloadAndProcess(imageUrl, filepath);
  console.log(`✓ 已保存: ${filepath}`);

  return { 
    id: config.id, 
    filename: config.filename, 
    description: config.description,
    url: imageUrl 
  };
}

// 主函数
async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const outputDir = path.join(repoRoot, 'ppt', 'images');

  await fs.mkdir(outputDir, { recursive: true });
  console.log(`输出目录: ${outputDir}`);
  console.log('开始生成 PPT 图片（使用新 API Key，无水印）...');
  console.log(`共 ${pptImagePrompts.length} 张图片\n`);

  const results = [];
  const errors = [];

  for (let i = 0; i < pptImagePrompts.length; i++) {
    const config = pptImagePrompts[i];
    try {
      const result = await generateSingleImage(config, outputDir);
      results.push(result);
      console.log(`进度: ${i + 1}/${pptImagePrompts.length}`);
      
      // 避免请求过快，每张图片之间等待 2 秒
      if (i < pptImagePrompts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`✗ 生成失败: ${config.id}`, error);
      errors.push({ id: config.id, error: String(error) });
    }
  }

  // 保存生成记录
  const recordPath = path.join(outputDir, 'generation-record.json');
  await fs.writeFile(
    recordPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: 'doubao-seedream-4-5-251128',
        apiKey: 'PPT专用API (7041e3a8-...)',
        size: '2K',
        output: `${TARGET_WIDTH}x${TARGET_HEIGHT}`,
        watermark: false,
        negativePrompt: NEGATIVE_PROMPT,
        total: pptImagePrompts.length,
        success: results.length,
        failed: errors.length,
        results,
        errors,
      },
      null,
      2,
    ),
  );

  console.log('\n========================================');
  console.log('生成完成！');
  console.log(`成功: ${results.length} 张`);
  console.log(`失败: ${errors.length} 张`);
  console.log(`记录文件: ${recordPath}`);
  console.log('========================================\n');
}

main().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
