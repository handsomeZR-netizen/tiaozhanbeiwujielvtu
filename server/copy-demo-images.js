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
    // 检查源目录是否存在
    try {
      await fs.access(sourceDir);
    } catch {
      // 源目录不存在（Railway环境），检查目标目录是否已有文件
      try {
        const existingFiles = await fs.readdir(targetDir);
        const jpgFiles = existingFiles.filter(f => f.endsWith('.jpg'));
        if (jpgFiles.length > 0) {
          console.log(`✅ Demo图片已存在于 server/public/demo-images/ (${jpgFiles.length} 个文件)`);
          console.log('⏭️  跳过复制步骤（Railway部署环境）');
          return;
        }
      } catch {
        // 目标目录也不存在
      }
      
      console.log('⚠️  源目录不存在，但这是正常的（Railway部署环境）');
      console.log('✅ Demo图片应该已经在Git仓库中的 server/public/demo-images/');
      return;
    }
    
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
    // 不要退出进程，让构建继续
    console.log('⚠️  继续构建...');
  }
}

copyDemoImages();
