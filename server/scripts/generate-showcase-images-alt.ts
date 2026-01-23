import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const ARK_API_KEY = process.env.ARK_API_KEY;
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;

if (!ARK_API_KEY) {
  console.error('缺少 ARK_API_KEY 环境变量');
  process.exit(1);
}

type PromptConfig = {
  id: string;
  filename: string;
  prompt: string;
};

const imagePrompts: PromptConfig[] = [
  {
    id: 'alt-01',
    filename: 'bg-01.jpg',
    prompt:
      '纪实摄影风格，4K超高清，横向构图，16:9，西安城墙傍晚金色光线，中国青年与外国游客并肩交流，轻松微笑，城墙与古城建筑背景，暖色胶片质感，画面留白适合网页标题',
  },
  {
    id: 'alt-02',
    filename: 'bg-02.jpg',
    prompt:
      '清新日系摄影风格，4K超高清，横向构图，16:9，苏州园林雨后青瓦白墙，竹影与回廊，中国人与外国游客轻声交流合影，空气清透，柔和漫射光，画面留白适合网页标题',
  },
  {
    id: 'alt-03',
    filename: 'bg-03.jpg',
    prompt:
      '城市夜景摄影风格，4K超高清，横向构图，16:9，重庆洪崖洞夜色灯火通明，中国人与外国游客在观景平台交流拍照，霓虹暖色反射，氛围热烈但友好，画面留白适合网页标题',
  },
  {
    id: 'alt-04',
    filename: 'bg-04.jpg',
    prompt:
      'cinematic documentary photography, 4k ultra high resolution, horizontal 16:9 composition, Guangzhou Canton Tower skyline and Pearl River at night, Chinese local introducing the city night view to foreign friends, natural smiles, blue and warm gold color grading, clean background, no text, no words, no signage, no letters, space for webpage headline',
  },
  {
    id: 'alt-05',
    filename: 'bg-05.jpg',
    prompt:
      '自然风光摄影风格，4K超高清，横向构图，16:9，桂林漓江竹筏与喀斯特群山，中国人与外国游客轻松交流，薄雾与清晨柔光，清新明亮色调，画面留白适合网页标题',
  },
];

const onlyId = process.env.SHOWCASE_ONLY;
const promptsToGenerate = onlyId
  ? imagePrompts.filter((item) => item.id === onlyId || item.filename === onlyId)
  : imagePrompts;

async function generateImage(prompt: string, size: string = '2K') {
  const response = await fetch(`${ARK_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ARK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt,
      response_format: 'url',
      size,
      sequential_image_generation: 'disabled',
      watermark: false,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

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
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(filepath);
}

async function generateSingleImage(config: PromptConfig, outputDir: string) {
  console.log(`\n生成图片: ${config.id}`);
  console.log(`提示词: ${config.prompt}`);

  const result = await generateImage(config.prompt, '2K');
  const imageUrl = result?.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('API 返回数据格式错误（未包含 URL）');
  }

  const filepath = path.join(outputDir, config.filename);
  await downloadAndProcess(imageUrl, filepath);
  console.log(`已保存: ${filepath}`);

  return { id: config.id, filename: config.filename, url: imageUrl };
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const outputDir = path.join(repoRoot, 'public', 'showcase', 'scroll-alt');

  await fs.mkdir(outputDir, { recursive: true });
  console.log(`输出目录: ${outputDir}`);
  console.log('开始生成展示页滚动背景图（第二层，无水印）...');

  const results = [];

  for (const config of promptsToGenerate) {
    const result = await generateSingleImage(config, outputDir);
    results.push(result);
    if (config !== promptsToGenerate[promptsToGenerate.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const recordPath = path.join(outputDir, 'generation-record.json');
  await fs.writeFile(
    recordPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: 'doubao-seedream-4-5-251128',
        size: '2K',
        output: `${TARGET_WIDTH}x${TARGET_HEIGHT}`,
        watermark: false,
        total: results.length,
        results,
      },
      null,
      2,
    ),
  );

  console.log('\n全部完成！');
  console.log(`记录文件: ${recordPath}`);
}

main().catch((error) => {
  console.error('生成失败:', error);
  process.exit(1);
});
