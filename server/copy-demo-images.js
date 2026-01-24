// 复制demo图片到server目录，确保Railway部署时可以访问
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyDemoImages() {
  const sourceDir = path.join(__dirname, '../public/demo-images');
  const targetDir = path.join(__dirname, 'public/demo-images');
  
  try {
    // 创建目标目录
    await fs.mkdir(targetDir, { recursive: true });
    
    // 读取源目录
    const files = await fs.readdir(sourceDir);
    
    console.log('📦 复制demo图片到server目录...\n');
    
    let copied = 0;
    for (const file of files) {
      if (!file.endsWith('.jpg')) continue;
      
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      await fs.copyFile(sourcePath, targetPath);
      console.log(`✅ ${file}`);
      copied++;
    }
    
    console.log(`\n✨ 成功复制 ${copied} 个文件！`);
  } catch (error) {
    console.error('❌ 复制失败:', error.message);
    process.exit(1);
  }
}

copyDemoImages();
