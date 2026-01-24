#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "🧪 运行所有测试"
echo "=========================================="
echo ""

# 测试 1: 检查环境变量
echo -e "${YELLOW}📋 测试 1: 检查环境变量${NC}"
npx tsx check-railway-env.ts
ENV_CHECK=$?

if [ $ENV_CHECK -ne 0 ]; then
    echo -e "${RED}❌ 环境变量检查失败${NC}"
    exit 1
fi

echo ""

# 测试 2: OSS 配置测试
echo -e "${YELLOW}📦 测试 2: OSS 配置测试${NC}"
npx tsx test-oss-complete.ts
OSS_CHECK=$?

if [ $OSS_CHECK -ne 0 ]; then
    echo -e "${RED}❌ OSS 配置测试失败${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 所有测试通过！${NC}"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 提交代码到 Git"
echo "2. 推送到 GitHub"
echo "3. Railway 会自动部署"
echo "4. 测试海报生成功能"
echo ""
