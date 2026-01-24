import { getPool } from './src/db.js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.server') });

async function checkData() {
  console.log('🔍 检查本地数据库...\n');
  
  const db = getPool();
  
  try {
    // 检查海报数据
    console.log('📊 海报数据 (posters)：');
    const posters = await db.query('SELECT id, image_url, city, created_at FROM posters ORDER BY created_at DESC LIMIT 10');
    
    if (posters.rowCount === 0) {
      console.log('   ❌ 没有海报数据\n');
    } else {
      console.log(`   总数: ${posters.rowCount} 条\n`);
      
      let needMigration = 0;
      let alreadyOSS = 0;
      let base64Count = 0;
      let tempUrl = 0;
      
      posters.rows.forEach((row, index) => {
        const url = row.image_url;
        let status = '';
        
        if (!url) {
          status = '❌ 空URL';
        } else if (url.startsWith('data:image')) {
          status = '📦 Base64 (不会过期)';
          base64Count++;
        } else if (url.includes('oss-ap-southeast-1.aliyuncs.com') || url.includes('xzr-tiaozhanbei')) {
          status = '✅ 已在OSS';
          alreadyOSS++;
        } else if (url.includes('picsum.photos')) {
          status = '🎨 Mock图片 (不会过期)';
        } else if (url.startsWith('http')) {
          status = '⚠️  临时URL (可能过期)';
          tempUrl++;
          needMigration++;
        } else {
          status = '❓ 未知格式';
        }
        
        console.log(`   ${index + 1}. ${row.city || '未知'} - ${status}`);
        console.log(`      ID: ${row.id}`);
        console.log(`      URL: ${url.substring(0, 80)}...`);
        console.log(`      创建时间: ${row.created_at}`);
        console.log('');
      });
      
      console.log('📈 统计：');
      console.log(`   ✅ 已在OSS: ${alreadyOSS} 条`);
      console.log(`   📦 Base64: ${base64Count} 条 (不需要迁移)`);
      console.log(`   ⚠️  临时URL: ${tempUrl} 条 (建议迁移)`);
      console.log(`   🎯 需要迁移: ${needMigration} 条\n`);
    }
    
    // 检查灵感工坊数据
    console.log('🎨 灵感工坊数据 (studio_history)：');
    const studio = await db.query('SELECT id, image, created_at FROM studio_history ORDER BY created_at DESC LIMIT 5');
    
    if (studio.rowCount === 0) {
      console.log('   ❌ 没有灵感工坊数据\n');
    } else {
      console.log(`   总数: ${studio.rowCount} 条\n`);
      
      studio.rows.forEach((row, index) => {
        const img = row.image;
        let status = '';
        
        if (!img) {
          status = '❌ 空图片';
        } else if (img.startsWith('data:image')) {
          status = '📦 Base64 (不会过期)';
        } else if (img.startsWith('http')) {
          status = '🔗 URL';
        } else {
          status = '❓ 未知格式';
        }
        
        console.log(`   ${index + 1}. ${status}`);
        console.log(`      ID: ${row.id}`);
        console.log(`      图片: ${img.substring(0, 80)}...`);
        console.log(`      创建时间: ${row.created_at}`);
        console.log('');
      });
    }
    
    // 检查社区帖子
    console.log('🌍 社区帖子 (community_posts)：');
    const community = await db.query('SELECT id, title, img FROM community_posts LIMIT 5');
    
    if (community.rowCount === 0) {
      console.log('   ❌ 没有社区帖子数据\n');
    } else {
      console.log(`   总数: ${community.rowCount} 条\n`);
      
      community.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.title}`);
        console.log(`      图片: ${row.img || '无图片'}`);
        console.log('');
      });
    }
    
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await db.end();
  }
}

checkData();
