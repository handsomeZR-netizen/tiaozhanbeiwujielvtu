import fsSync from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 直接设置环境变量
const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

// 下载图片
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fsSync.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err: Error) => {
        fsSync.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

// 生成图片（带水印）
async function generateImageWithWatermark(prompt: string) {
  if (!ARK_API_KEY) {
    throw new Error('Missing ARK_API_KEY environment variable');
  }
  console.log('\n🎨 测试 1: 生成带水印图片 (watermark: true)');
  console.log(`📝 提示词: ${prompt.substring(0, 60)}...`);

  const response = await fetch(`${ARK_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ARK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt,
      response_format: 'url',
      size: '2K',
      watermark: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

// 生成图片（无水印）
async function generateImageWithoutWatermark(prompt: string) {
  if (!ARK_API_KEY) {
    throw new Error('Missing ARK_API_KEY environment variable');
  }
  console.log('\n🎨 测试 2: 生成无水印图片 (watermark: false)');
  console.log(`📝 提示词: ${prompt.substring(0, 60)}...`);

  const response = await fetch(`${ARK_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ARK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt,
      response_format: 'url',
      size: '2K',
      watermark: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

// 主函数
async function main() {
  console.log('🚀 开始测试豆包 seedream 水印参数...\n');

  const testPrompt = '南京玄武湖清晨景色，薄雾笼罩湖面，远处紫金山轮廓，湖边有人打太极拳，骑行者在环湖道路上，温柔的晨光，宁静祥和的氛围，风光摄影风格，4K超高清质量，自然光线，蓝调色彩，电影级构图';

  const outputDir = path.join(__dirname, '../testimages/watermark-test');
  
  // 创建输出目录
  if (!fsSync.existsSync(outputDir)) {
    fsSync.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 测试 1: 带水印
    const result1 = await generateImageWithWatermark(testPrompt);
    
    if (result1.data && result1.data[0] && result1.data[0].url) {
      const imageUrl1 = result1.data[0].url;
      console.log(`✅ 图片生成成功: ${imageUrl1.substring(0, 80)}...`);
      
      const filepath1 = path.join(outputDir, 'with-watermark.jpg');
      await downloadImage(imageUrl1, filepath1);
      console.log(`💾 图片已保存: ${filepath1}`);
    } else {
      console.log('❌ API 返回数据格式错误');
      console.log(JSON.stringify(result1, null, 2));
    }

    console.log('\n⏳ 等待 3 秒...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 测试 2: 无水印
    const result2 = await generateImageWithoutWatermark(testPrompt);
    
    if (result2.data && result2.data[0] && result2.data[0].url) {
      const imageUrl2 = result2.data[0].url;
      console.log(`✅ 图片生成成功: ${imageUrl2.substring(0, 80)}...`);
      
      const filepath2 = path.join(outputDir, 'without-watermark.jpg');
      await downloadImage(imageUrl2, filepath2);
      console.log(`💾 图片已保存: ${filepath2}`);
    } else {
      console.log('❌ API 返回数据格式错误');
      console.log(JSON.stringify(result2, null, 2));
    }

    console.log('\n\n📊 测试完成！');
    console.log(`📁 图片保存位置: ${outputDir}`);
    console.log('\n请对比两张图片，检查是否有 AI 水印标识：');
    console.log('  - with-watermark.jpg (应该有水印)');
    console.log('  - without-watermark.jpg (应该无水印)');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  }
}

// 执行
main().catch(console.error);
