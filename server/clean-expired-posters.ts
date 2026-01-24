import { getPool } from './src/db.js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.server') });

async function cleanExpiredPosters() {
  console.log('🗑️  开始清理过期的海报记录...\n');
  
  const db = getPool();
  
  try {
    // 先查询要删除的记录
    const query = await db.query(`
      SELECT id, city, theme, created_at 
      FROM posters 
      WHERE image_url LIKE 'https://ark-content-generation%'
      ORDER BY created_at DESC
    `);
    
    if (query.rowCount === 0) {
      console.log('✅ 没有需要清理的过期记录\n');
      return;
    }
    
    console.log(`📊 找到 ${query.rowCount} 条过期记录：\n`);
    
    query.rows.forEach((row, index) => {
      const date = new Date(row.created_at).toLocaleString('zh-CN');
      console.log(`   ${index + 1}. ${row.city || '未知'} - ${row.theme || '未知主题'}`);
      console.log(`      创建时间: ${date}`);
      console.log(`      ID: ${row.id}\n`);
    });
    
    // 确认删除
    console.log('⚠️  这些记录的图片已过期无法访问，将被删除...\n');
    
    // 执行删除
    const result = await db.query(`
      DELETE FROM posters 
      WHERE image_url LIKE 'https://ark-content-generation%'
      RETURNING id
    `);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 成功删除 ${result.rowCount} 条过期记录`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 提示：');
    console.log('   - 从现在开始，新生成的海报会自动保存到阿里云OSS');
    console.log('   - 图片将永久保存，不会再过期');
    console.log('   - 部署后记得在Railway配置OSS环境变量\n');
    
  } catch (error: any) {
    console.error('❌ 清理失败:', error.message);
  } finally {
    await db.end();
  }
}

cleanExpiredPosters();
