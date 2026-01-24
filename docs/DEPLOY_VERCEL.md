# Vercel 前端部署指南

## 📋 前提条件

- ✅ GitHub 账号
- ✅ Vercel 账号（可用 GitHub 登录）
- ✅ Railway 后端已部署并获得域名
- ✅ 高德地图 API Key

---

## 🚀 部署步骤

### 步骤 1：准备后端地址

1. 登录 Railway
2. 进入你的后端 Service
3. 点击 **Settings** 标签
4. 找到 **Domains** 部分
5. 复制域名，格式类似：`https://your-service.up.railway.app`

### 步骤 2：登录 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击右上角 **Sign Up** 或 **Log In**
3. 选择 **Continue with GitHub**
4. 授权 Vercel 访问你的 GitHub

### 步骤 3：导入项目

1. 在 Vercel 首页点击 **Add New...** → **Project**
2. 在仓库列表中找到 `handsomeZR-netizen/tiaozhanbeiwujielvtu`
3. 点击 **Import**

### 步骤 4：配置项目

Vercel 会自动检测到 Vite 项目，默认配置如下：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**无需修改**，直接进入下一步。

### 步骤 5：配置环境变量

在部署前，点击 **Environment Variables** 展开，添加以下变量：

#### 必需变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE` | `https://your-service.up.railway.app` | Railway 后端地址 |
| `VITE_AMAP_KEY` | `你的高德地图key` | 高德地图 Web API Key |
| `VITE_AMAP_SECURITY_CODE` | `你的安全密钥` | 高德地图安全码 |

#### 可选变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | `你的Gemini密钥` | Google AI 功能（可选） |

**添加方式：**
1. 在 **Key** 输入框输入变量名（如 `VITE_API_BASE`）
2. 在 **Value** 输入框输入对应的值
3. 点击 **Add** 按钮
4. 重复以上步骤添加所有变量

### 步骤 6：开始部署

1. 确认所有环境变量已添加
2. 点击 **Deploy** 按钮
3. 等待部署完成（通常 1-3 分钟）

### 步骤 7：查看部署结果

部署成功后，你会看到：
- ✅ 部署状态：**Ready**
- 🌐 访问地址：`https://your-project.vercel.app`

点击 **Visit** 按钮访问你的网站！

---

## 🔧 部署后配置

### 自定义域名（可选）

1. 在 Vercel 项目页面，点击 **Settings**
2. 选择 **Domains** 标签
3. 点击 **Add Domain**
4. 输入你的域名（如 `www.yourdomain.com`）
5. 按照提示在域名服务商处添加 DNS 记录

### 更新环境变量

如果需要修改环境变量：

1. 进入项目 **Settings** → **Environment Variables**
2. 找到要修改的变量，点击右侧的 **Edit**
3. 修改值后点击 **Save**
4. 回到 **Deployments** 标签
5. 点击最新部署右侧的 **...** → **Redeploy**

---

## 🔄 自动部署

Vercel 已自动配置 GitHub 集成：

- ✅ 推送到 `main` 分支 → 自动部署到生产环境
- ✅ 推送到其他分支 → 自动创建预览部署
- ✅ Pull Request → 自动创建预览链接

**无需额外配置！**

---

## 🐛 常见问题

### 问题 1：部署成功但页面空白

**原因**：环境变量未配置或配置错误

**解决方法**：
1. 检查 `VITE_API_BASE` 是否正确
2. 确保 Railway 后端正常运行
3. 在浏览器控制台查看错误信息

### 问题 2：API 请求失败

**原因**：后端地址错误或 CORS 配置问题

**解决方法**：
1. 确认 `VITE_API_BASE` 地址正确
2. 检查 Railway 后端是否正常运行
3. 确保后端 CORS 配置允许 Vercel 域名

### 问题 3：地图无法显示

**原因**：高德地图 API Key 未配置或配置错误

**解决方法**：
1. 检查 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`
2. 确认 API Key 已启用 Web 服务
3. 在高德控制台检查 Key 的使用限制

### 问题 4：构建失败

**原因**：依赖安装失败或代码错误

**解决方法**：
1. 查看 Vercel 构建日志
2. 本地运行 `npm run build` 测试
3. 确保 `package.json` 中的依赖版本正确

---

## 📊 性能优化

### 启用 Edge Network

Vercel 自动启用全球 CDN，无需配置。

### 图片优化

如果使用大量图片，建议：
1. 使用 WebP 格式
2. 启用懒加载
3. 使用 Vercel Image Optimization

### 缓存策略

Vercel 自动配置最佳缓存策略：
- 静态资源：长期缓存
- HTML：短期缓存
- API 请求：不缓存

---

## 🔒 安全建议

1. **环境变量**：不要在前端代码中硬编码密钥
2. **HTTPS**：Vercel 自动启用 HTTPS
3. **CORS**：确保后端 CORS 配置正确
4. **API 限流**：在后端配置 API 限流

---

## 📈 监控和分析

### Vercel Analytics

1. 进入项目 **Analytics** 标签
2. 查看访问量、性能指标等
3. 免费版有基础分析功能

### 日志查看

1. 进入项目 **Deployments** 标签
2. 点击具体部署查看构建日志
3. 点击 **Functions** 查看运行时日志（如果有）

---

## 🎯 下一步

- ✅ 配置自定义域名
- ✅ 设置 GitHub 分支保护
- ✅ 配置 Vercel Analytics
- ✅ 添加 SEO 优化
- ✅ 配置 PWA（如需要）

---

## 📞 获取帮助

- Vercel 文档：https://vercel.com/docs
- Vercel 社区：https://github.com/vercel/vercel/discussions
- 项目 Issues：https://github.com/handsomeZR-netizen/tiaozhanbeiwujielvtu/issues
