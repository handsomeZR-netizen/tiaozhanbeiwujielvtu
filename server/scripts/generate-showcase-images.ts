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
    id: 'bg-01',
    filename: 'bg-01.jpg',
    prompt:
      '旅行纪录片摄影风格，4K超高清，横向构图，16:9，清晨柔光下的长城，中国青年与外国游客在城墙上微笑交流、指向远处景色，穿着日常旅行服装，皮肤质感真实，广角构图，温暖开放的氛围，自然光线，真实人像比例，画面留白适合网页标题',
  },
  {
    id: 'bg-02',
    filename: 'bg-02.jpg',
    prompt:
      '真实纪实摄影风格，4K超高清，横向构图，16:9，杭州西湖边，柳树与湖面背景，中国人与外国游客轻松对话合影，笑容自然，清新暖色调，自然光，旅行纪录片质感，真实人像比例，和谐交流，画面留白适合网页标题',
  },
  {
    id: 'bg-03',
    filename: 'bg-03.jpg',
    prompt:
      '真实摄影风格，4K超高清，横向构图，16:9，北京故宫红墙金瓦背景，中国讲解者与外国游客交流导览，姿态自然，面部细节清晰，广角构图，庄重但温暖的氛围，文化交流场景，画面留白适合网页标题',
  },
  {
    id: 'bg-04',
    filename: 'bg-04.jpg',
    prompt:
      '纪录片摄影风格，4K超高清，横向构图，16:9，上海外滩黄昏天际线背景，中国青年与外国朋友并肩交流，微笑自然，城市旅行氛围，暖色光线，电影感，真实人像比例，画面留白适合网页标题',
  },
  {
    id: 'bg-05',
    filename: 'bg-05.jpg',
    prompt:
      '真实摄影风格，4K超高清，横向构图，16:9，张家界峰林薄雾背景，中国人与外国游客一起交流拍照，轻松愉快，自然光线，旅行纪录片质感，绿色山体与远景层次，画面留白适合网页标题',
  },
];

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
  const outputDir = path.join(repoRoot, 'public', 'showcase', 'scroll');

  await fs.mkdir(outputDir, { recursive: true });
  console.log(`输出目录: ${outputDir}`);
  console.log('开始生成展示页滚动背景图（无水印）...');

  const results = [];

  for (const config of imagePrompts) {
    const result = await generateSingleImage(config, outputDir);
    results.push(result);
    if (config !== imagePrompts[imagePrompts.length - 1]) {
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
