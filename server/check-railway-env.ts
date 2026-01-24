#!/usr/bin/env tsx
/**
 * Railway 环境变量检查脚本
 * 
 * 用于验证 Railway 部署时的环境变量配置
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.server 文件
config({ path: resolve(process.cwd(), '.env.server') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

console.log('\n' + '='.repeat(60));
console.log('🔍 Railway 环境变量检查');
console.log('='.repeat(60) + '\n');

const envVars = [
  // 服务器配置
  { name: 'PORT', required: false, description: '服务器端口（Railway 自动设置）' },
  { name: 'HOST', required: false, description: '服务器主机（应为 0.0.0.0）' },
  
  // 数据库
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL 连接字符串' },
  
  // 阿里云 OSS
  { name: 'ALIYUN_OSS_REGION', required: true, description: 'OSS 区域' },
  { name: 'ALIYUN_OSS_ACCESS_KEY_ID', required: true, description: 'OSS AccessKey ID' },
  { name: 'ALIYUN_OSS_ACCESS_KEY_SECRET', required: true, description: 'OSS AccessKey Secret' },
  { name: 'ALIYUN_OSS_BUCKET', required: true, description: 'OSS Bucket 名称' },
  
  // AI 服务
  { name: 'ARK_API_KEY', required: true, description: '豆包 API 密钥' },
  { name: 'DEEPSEEK_API_KEY', required: false, description: 'DeepSeek API 密钥（可选）' },
  
  // 高德地图
  { name: 'AMAP_WEB_SERVICE_KEY', required: false, description: '高德地图 Web 服务密钥（可选）' },
];

let missingRequired = 0;
let missingOptional = 0;

envVars.forEach((envVar) => {
  const value = process.env[envVar.name];
  
  if (value) {
    // 隐藏敏感信息
    const displayValue = envVar.name.includes('SECRET') || envVar.name.includes('KEY') || envVar.name.includes('PASSWORD')
      ? '***' + value.slice(-4)
      : value.length > 50
      ? value.slice(0, 30) + '...' + value.slice(-10)
      : value;
    
    log.success(`${envVar.name}: ${displayValue}`);
    log.info(`   ${envVar.description}`);
  } else {
    if (envVar.required) {
      log.error(`${envVar.name}: 未设置（必需）`);
      log.error(`   ${envVar.description}`);
      missingRequired++;
    } else {
      log.warning(`${envVar.name}: 未设置（可选）`);
      log.info(`   ${envVar.description}`);
      missingOptional++;
    }
  }
  console.log('');
});

console.log('='.repeat(60));
console.log('📊 检查结果');
console.log('='.repeat(60));

if (missingRequired === 0) {
  log.success('✅ 所有必需的环境变量已配置');
  
  if (missingOptional > 0) {
    log.warning(`⚠️  ${missingOptional} 个可选环境变量未配置`);
  }
  
  console.log('\n✅ 环境变量配置正确，可以部署到 Railway！\n');
  process.exit(0);
} else {
  log.error(`❌ ${missingRequired} 个必需的环境变量未配置`);
  
  console.log('\n❌ 请在 Railway 控制台配置缺失的环境变量：');
  console.log('1. 登录 https://railway.app/');
  console.log('2. 进入项目 → 后端 Service');
  console.log('3. 点击 Variables 标签');
  console.log('4. 添加缺失的环境变量\n');
  
  process.exit(1);
}
