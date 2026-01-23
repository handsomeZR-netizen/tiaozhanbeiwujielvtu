import { config } from 'dotenv';
import { generateImage } from '../src/services/doubao.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'https';
import http from 'http';

// 加载环境变量
config({ path: join(process.cwd(), '.env.server') });

const TEST_PROMPTS = [
  {
    id: 'lantern-festival',
    prompt: '中国传统红灯笼挂满古街，夜晚温暖灯光，石板路，明清建筑风格，电影感构图，高清摄影',
    description: '传统灯笼节庆场景',
    tags: ['灯笼', '古街', '节庆', '夜景'],
  },
  {
    id: 'tea-ceremony',
    prompt: '中国传统茶艺表演，紫砂茶壶，竹制茶盘，茶叶特写，温暖自然光，禅意美学，高清摄影',
    description: '茶文化与茶艺',
    tags: ['茶艺', '茶道', '传统工艺', '禅意'],
  },
  {
    id: 'temple-architecture',
    prompt: '中国古代寺庙建筑，红墙金瓦，飞檐斗拱，香炉青烟，蓝天白云，对称构图，建筑摄影',
    description: '寺庙建筑与宗教文化',
    tags: ['寺庙', '建筑', '宗教', '古建筑'],
  },
  {
    id: 'calligraphy-art',
    prompt: '中国书法艺术，毛笔字特写，宣纸墨迹，文房四宝，侧光拍摄，文化氛围，艺术摄影',
    description: '书法艺术与文房四宝',
    tags: ['书法', '毛笔', '文化', '艺术'],
  },
  {
    id: 'dragon-dance',
    prompt: '中国舞龙表演，金色巨龙，节庆人群，动态瞬间，烟花背景，广角镜头，节日氛围',
    description: '舞龙表演与民俗庆典',
    tags: ['舞龙', '民俗', '庆典', '表演'],
  },
  {
    id: 'hutong-alley',
    prompt: '北京胡同街景，灰砖四合院，红色大门，自行车，老人下棋，生活气息，纪实摄影',
    description: '胡同生活与传统民居',
    tags: ['胡同', '四合院', '生活方式', '民居'],
  },
  {
    id: 'silk-weaving',
    prompt: '中国丝绸织造工艺，传统织布机，彩色丝线，工匠手工操作，细节特写，工艺美学',
    description: '丝绸织造传统工艺',
    tags: ['丝绸', '织造', '工艺', '手工'],
  },
  {
    id: 'opera-mask',
    prompt: '中国京剧脸谱特写，红色花脸，精致彩绘，戏曲服饰，舞台灯光，传统艺术，人像摄影',
    description: '京剧脸谱与戏曲艺术',
    tags: ['京剧', '脸谱', '戏曲', '传统艺术'],
  },
  {
    id: 'rice-terrace',
    prompt: '中国南方梯田景观，层层叠叠，绿色稻田，水面倒影，晨雾缭绕，航拍视角，自然风光',
    description: '梯田农耕文化景观',
    tags: ['梯田', '农耕', '自然', '景观'],
  },
  {
    id: 'paper-cutting',
    prompt: '中国剪纸艺术，红色窗花，精细镂空图案，春节装饰，逆光拍摄，民间艺术，特写摄影',
    description: '剪纸艺术与节庆装饰',
    tags: ['剪纸', '窗花', '民间艺术', '春节'],
  },
];

const downloadImage = (url: string, filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        writeFileSync(filepath, Buffer.concat(chunks));
        resolve();
      });
      response.on('error', reject);
    }).on('error', reject);
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const testImagesDir = join(process.cwd(), 'testimages');
  mkdirSync(testImagesDir, { recursive: true });

  const results = [];
  console.log('🎨 开始生成测试图片...\n');

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const item = TEST_PROMPTS[i];
    console.log(`[${i + 1}/${TEST_PROMPTS.length}] 生成: ${item.description}`);
    console.log(`提示词: ${item.prompt}`);

    try {
      const response = await generateImage(item.prompt, '2048x2048');
      
      let imageUrl = '';
      if (response?.data?.[0]?.url) {
        imageUrl = response.data[0].url;
      } else if (response?.output?.image_url) {
        imageUrl = response.output.image_url;
      } else if (typeof response === 'string') {
        imageUrl = response;
      }

      if (!imageUrl) {
        console.error('❌ 未找到图片URL');
        console.log('响应:', JSON.stringify(response, null, 2));
        continue;
      }

      const filename = `${item.id}.jpg`;
      const filepath = join(testImagesDir, filename);
      
      console.log(`📥 下载图片: ${imageUrl}`);
      await downloadImage(imageUrl, filepath);
      
      results.push({
        id: item.id,
        filename,
        description: item.description,
        tags: item.tags,
        prompt: item.prompt,
        url: imageUrl,
        generatedAt: new Date().toISOString(),
      });

      console.log(`✅ 保存成功: ${filename}\n`);
      
      // 避免请求过快，等待3秒
      if (i < TEST_PROMPTS.length - 1) {
        console.log('⏳ 等待3秒...\n');
        await sleep(3000);
      }
    } catch (error: any) {
      console.error(`❌ 生成失败: ${error.message}\n`);
      results.push({
        id: item.id,
        filename: '',
        description: item.description,
        tags: item.tags,
        prompt: item.prompt,
        error: error.message,
        generatedAt: new Date().toISOString(),
      });
    }
  }

  // 保存记录
  const recordPath = join(testImagesDir, 'test-images-record.json');
  writeFileSync(recordPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n📝 记录已保存: ${recordPath}`);

  // 生成 Markdown 文档
  const mdLines = [
    '# 测试图片集合',
    '',
    `生成时间: ${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 图片列表',
    '',
  ];

  results.forEach((item, index) => {
    mdLines.push(`### ${index + 1}. ${item.description}`);
    mdLines.push('');
    mdLines.push(`- **ID**: ${item.id}`);
    mdLines.push(`- **文件**: ${item.filename || '生成失败'}`);
    mdLines.push(`- **标签**: ${item.tags.join(', ')}`);
    mdLines.push(`- **提示词**: ${item.prompt}`);
    if (item.error) {
      mdLines.push(`- **错误**: ${item.error}`);
    }
    if (item.filename) {
      mdLines.push('');
      mdLines.push(`![${item.description}](./${item.filename})`);
    }
    mdLines.push('');
  });

  const mdPath = join(testImagesDir, 'README.md');
  writeFileSync(mdPath, mdLines.join('\n'), 'utf-8');
  console.log(`📄 文档已生成: ${mdPath}`);

  const successCount = results.filter(r => r.filename).length;
  console.log(`\n✨ 完成! 成功生成 ${successCount}/${TEST_PROMPTS.length} 张图片`);
};

main().catch(console.error);
