import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const main = () => {
  const recordPath = join(process.cwd(), 'testimages', 'test-images-record.json');
  const publicDir = join(process.cwd(), '..', 'public', 'demo-images');
  
  // 创建目标目录
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // 读取记录
  const record = JSON.parse(readFileSync(recordPath, 'utf-8'));
  
  console.log('📦 复制测试图片到 public 目录...\n');
  
  const demoCases = [];
  
  for (const item of record) {
    if (!item.filename) continue;
    
    const sourcePath = join(process.cwd(), 'testimages', item.filename);
    const targetPath = join(publicDir, item.filename);
    
    if (existsSync(sourcePath)) {
      copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${item.filename}`);
      
      demoCases.push({
        id: item.id,
        thumbnail: `/demo-images/${item.filename}`,
        title: item.description,
        description: item.prompt.substring(0, 50) + '...',
        tags: item.tags,
      });
    }
  }
  
  // 生成 TypeScript 常量
  const tsContent = `// 自动生成的案例数据
export const DEMO_CASES = ${JSON.stringify(demoCases, null, 2)};
`;
  
  const tsPath = join(process.cwd(), '..', 'demo-cases.ts');
  writeFileSync(tsPath, tsContent, 'utf-8');
  
  console.log(`\n📝 已生成案例数据: ${tsPath}`);
  console.log(`✨ 完成! 共复制 ${demoCases.length} 张图片`);
};

main();
