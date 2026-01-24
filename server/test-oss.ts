import OSS from 'ali-oss';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.server') });

const client = new OSS({
  region: process.env.ALIYUN_OSS_REGION!,
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.ALIYUN_OSS_BUCKET!,
});

async function test() {
  console.log('🔍 测试阿里云OSS配置...\n');
  console.log('配置信息:');
  console.log('  Region:', process.env.ALIYUN_OSS_REGION);
  console.log('  Bucket:', process.env.ALIYUN_OSS_BUCKET);
  console.log('  AccessKey ID:', process.env.ALIYUN_OSS_ACCESS_KEY_ID?.slice(0, 10) + '...');
  console.log('');

  try {
    // 测试1: 上传文本文件
    console.log('📤 测试上传文件...');
    const testContent = `OSS测试文件\n创建时间: ${new Date().toISOString()}`;
    const result = await client.put('test/test.txt', Buffer.from(testContent));
    console.log('✅ 上传成功!');
    console.log('   URL:', result.url);
    console.log('');

    // 测试2: 读取文件
    console.log('📥 测试读取文件...');
    const getResult = await client.get('test/test.txt');
    console.log('✅ 读取成功!');
    console.log('   内容:', getResult.content.toString());
    console.log('');

    // 测试3: 列出文件
    console.log('📋 测试列出文件...');
    const listResult = await client.list({ prefix: 'test/', 'max-keys': 10 });
    console.log('✅ 列出成功!');
    console.log('   文件数量:', listResult.objects?.length || 0);
    console.log('');

    // 测试4: 删除文件
    console.log('🗑️  测试删除文件...');
    await client.delete('test/test.txt');
    console.log('✅ 删除成功!');
    console.log('');

    console.log('🎉 所有测试通过! OSS配置正确!');
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    if (error.code) {
      console.error('   错误代码:', error.code);
    }
    if (error.status) {
      console.error('   HTTP状态:', error.status);
    }
    process.exit(1);
  }
}

test();
