import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '..', '.env.server') });

const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const ARK_API_KEY = process.env.ARK_API_KEY;

// 更大的纵向尺寸，适合网页背景滚动
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1400; // 从 1080 增加到 1400

if (!ARK_API_KEY) {
  console.error('缺少 ARK_API_KEY 环境变量');
  process.exit(1);
}

// 优化后的提示词：更大纵向空间，避免中文字符问题
const IMPROVED_PROMPT = `
真实纪实摄影风格，4K超高清，横向构图，宽高比适合网页背景，
杭州西湖边，柳树与湖面背景，中国人与外国游客轻松对话合影，
笑容自然，清新暖色调，自然光，旅行纪录片质感，
真实人像比例，和谐交流，画面上下留白充足适合网页标题和内容展示，
纵向空间宽敞，无文字水印，纯图像内容
`.trim().replace(/\n/g, ' ');

async function generateImage(prompt: string) {
  console.log('调用豆包 API...');
  console.log('提示词:', prompt);
  
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
      size: '2K',
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
  console.log('下载图片...');
  const imageRes = await fetch(url);
  if (!imageRes.ok) {
    throw new Error(`Failed to download image: ${imageRes.status}`);
  }
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  console.log(`处理图片，目标尺寸: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  await sharp(buffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'cover',
      position: 'attention',
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(filepath);
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const outputDir = path.join(repoRoot, 'public', 'showcase', 'scroll');
  const filepath = path.join(outputDir, 'bg-02.jpg');

  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('\n=== 重新生成 bg-02.jpg ===');
  console.log(`输出路径: ${filepath}`);
  console.log(`目标尺寸: ${TARGET_WIDTH}x${TARGET_HEIGHT}\n`);

  const result = await generateImage(IMPROVED_PROMPT);
  const imageUrl = result?.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('API 返回数据格式错误（未包含 URL）');
  }

  console.log('生成成功，URL:', imageUrl);
  
  await downloadAndProcess(imageUrl, filepath);
  
  console.log(`\n✓ 已保存: ${filepath}`);
  console.log(`✓ 尺寸: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  
  // 更新生成记录
  const recordPath = path.join(outputDir, 'generation-record.json');
  try {
    const recordContent = await fs.readFile(recordPath, 'utf-8');
    const record = JSON.parse(recordContent);
    
    // 更新 bg-02 的记录
    const bg02Index = record.results.findIndex((r: any) => r.id === 'bg-02');
    if (bg02Index !== -1) {
      record.results[bg02Index] = {
        id: 'bg-02',
        filename: 'bg-02.jpg',
        url: imageUrl,
        regeneratedAt: new Date().toISOString(),
        size: `${TARGET_WIDTH}x${TARGET_HEIGHT}`,
      };
      record.lastUpdated = new Date().toISOString();
      
      await fs.writeFile(recordPath, JSON.stringify(record, null, 2));
      console.log(`✓ 已更新生成记录: ${recordPath}`);
    }
  } catch (error) {
    console.warn('更新记录文件失败（可忽略）:', error);
  }

  console.log('\n完成！');
}

main().catch((error) => {
  console.error('生成失败:', error);
  process.exit(1);
});
