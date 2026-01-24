# 🎯 集成验证清单

## 立即验证（本地）

### 1. 验证社区图片 ✅
```bash
# 检查图片是否存在
dir public\community-posts
```
**预期结果：** 应该看到16个jpg文件

### 2. 验证OSS连接 ✅
```bash
cd server
npx tsx test-oss.ts
```
**预期结果：** 
```
🎉 所有测试通过! OSS配置正确!
```

### 3. 启动本地服务测试
```bash
# 终端1：启动后端
cd server
npm run dev

# 终端2：启动前端
npm run dev
```

### 4. 测试功能
1. 访问 http://localhost:5173
2. 登录账号
3. 进入"社区灵感"页面 → 检查图片是否显示
4. 进入"海报工作台" → 生成一张海报 → 检查是否成功

---

## 部署到Railway

### 步骤1：推送代码
```bash
git add .
git commit -m "feat: integrate Aliyun OSS + fix community images"
git push
```

### 步骤2：配置Railway环境变量

访问 Railway 项目 → 后端Service → Variables，添加：

```
ALIYUN_OSS_REGION=oss-ap-southeast-1
ALIYUN_OSS_ACCESS_KEY_ID=your_access_key_id_here
ALIYUN_OSS_ACCESS_KEY_SECRET=your_access_key_secret_here
ALIYUN_OSS_BUCKET=your_bucket_name_here
```

### 步骤3：等待部署完成

Railway会自动部署，查看：
- Deployments标签 → 确认状态为Success
- Logs标签 → 检查是否有错误

### 步骤4：验证线上功能

1. 访问你的Vercel前端地址
2. 登录账号
3. 测试社区图片显示
4. 测试海报生成功能

---

## 🐛 如果遇到问题

### 社区图片不显示
**检查：**
- [ ] `public/community-posts/` 目录是否存在
- [ ] 前端是否重新构建并部署
- [ ] 浏览器控制台是否有404错误

**解决：**
```bash
# 重新构建前端
npm run build

# 重新部署到Vercel
git push
```

### 海报生成失败
**检查：**
- [ ] Railway环境变量是否正确
- [ ] Railway Logs是否有OSS错误
- [ ] 豆包API密钥是否有效

**解决：**
1. 检查Railway Variables
2. 查看Railway Logs
3. 重新部署

### OSS上传失败但海报生成成功
**说明：** 降级机制生效，使用了临时URL
**影响：** 图片可能在一段时间后失效
**解决：** 检查OSS配置和网络连接

---

## ✅ 验证成功标志

- [x] 本地OSS测试通过
- [x] 本地社区图片显示正常
- [ ] 本地海报生成成功
- [ ] Railway部署成功
- [ ] 线上社区图片显示正常
- [ ] 线上海报生成成功
- [ ] 海报历史记录正常显示

---

## 📊 完成情况总结

### 已完成 ✅
1. 阿里云OSS集成
2. 海报图片持久化存储
3. 社区图片迁移到public目录
4. 本地测试通过

### 待完成 ⏳
1. 推送代码到GitHub
2. 配置Railway环境变量
3. 验证线上功能

---

## 🎉 下一步

完成上述验证后，你的应用将：
- ✅ 社区图片正常显示（所有用户看同一套）
- ✅ 海报生成后永久保存到OSS
- ✅ 海报历史记录可靠
- ✅ 灵感工坊历史正常工作

**预计时间：** 10-15分钟完成部署和验证
