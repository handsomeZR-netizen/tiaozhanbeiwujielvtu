import { uploadBase64ToOSS } from './src/utils/aliyun-oss.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadDemoImages() {
  const demoDir = path.join(__dirname, '../public/demo-images');
  
  try {
    const files = await fs.readdir(demoDir);
    console.log('🚀 开始上传demo图片到OSS...\n');
    
    for (const file of files) {
      if (!file.endsWith('.jpg')) continue;
      
      const localPath = path.join(demoDir, file);
      const fileBuffer = await fs.readFile(localPath);
      const base64 = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      
      try {
        // 使用 demo-images/ 前缀而不是 posters/
        const url = await uploadBase64ToOSS(base64, `../demo-images/${file}`);
        console.log(`✅ ${file}`);
        console.log(`   ${url}\n`);
      } catch (error: any) {
        console.error(`❌ ${file} 上传失败:`, error.message);
      }
    }
    
    console.log('\n✨ 上传完成！');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

uploadDemoImages();
