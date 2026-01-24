import { getPool } from './src/db.js';
import { uploadImageToOSS } from './src/utils/aliyun-oss.js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.server') });

async function migratePosters() {
  console.log('🚀 开始迁移海报到阿里云OSS...\n');
  
  const db = getPool();
  
  try {
    // 查询所有需要迁移的海报
    const result = await db.query(`
      SELECT id, image_url, city, created_at 
      FROM posters 
      WHERE image_url LIKE 'https://ark-content-generation%'
      ORDER BY created_at DESC
    `);
    
    if (result.rowCount === 0) {
      console.log('✅ 没有需要迁移的海报\n');
      return;
    }
    
    console.log(`📊 找到 ${result.rowCount} 条需要迁移的海报\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];
      const index = i + 1;
      
      console.log(`[${index}/${result.rowCount}] 处理: ${row.city || '未知'} (${row.id})`);
      console.log(`   原URL: ${row.image_url.substring(0, 80)}...`);
      
      try {
        // 下载图片
        console.log('   📥 下载图片...');
        const response = await fetch(row.image_url);
        
        if (!response.ok) {
          throw new Error(`下载失败: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`   📦 图片大小: ${(buffer.length / 1024).toFixed(2)} KB`);
        
        // 上传到OSS
        console.log('   📤 上传到OSS...');
        const filename = `${row.id}.png`;
        const ossUrl = await uploadImageToOSS(buffer, filename);
        
        console.log(`   ✅ OSS URL: ${ossUrl}`);
        
        // 更新数据库
        await db.query('UPDATE posters SET image_url = $1 WHERE id = $2', [ossUrl, row.id]);
        
        console.log(`   ✅ 数据库已更新\n`);
        successCount++;
        
        // 延迟一下，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`   ❌ 失败: ${error.message}\n`);
        failCount++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 迁移完成！');
    console.log(`   ✅ 成功: ${successCount} 条`);
    console.log(`   ❌ 失败: ${failCount} 条`);
    console.log(`   📈 总计: ${result.rowCount} 条`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (successCount > 0) {
      console.log('🎉 迁移成功！你的海报图片现在永久保存在阿里云OSS了！');
      console.log('🔗 访问 https://oss.console.aliyun.com/ 查看上传的文件\n');
    }
    
  } catch (error: any) {
    console.error('❌ 迁移失败:', error.message);
  } finally {
    await db.end();
  }
}

migratePosters();
