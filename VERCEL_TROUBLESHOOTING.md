# Vercel 部署故障排查指南

## ✅ 部署前检查清单

### 1. 本地构建测试
```bash
npm run build
npm run preview
```
- ✅ 本地构建成功
- ✅ 预览正常工作

### 2. 文件确认
- ✅ `vercel.json` 存在于项目根目录
- ✅ `package.json` 包含正确的构建脚本
- ✅ `dist/` 目录包含构建产物

### 3. Git 状态
```bash
git status
git log -1
```
确保所有文件已提交并推送到 GitHub

---

## 🚀 Vercel 部署步骤

### 步骤 1：导入项目
1. 访问 https://vercel.com
2. 点击 "Add New..." → "Project"
3. 选择仓库：`handsomeZR-netizen/tiaozhanbeiwujielvtu`
4. 点击 "Import"

### 步骤 2：项目配置（自动检测）
Vercel 应该自动检测到：
- **Framework Preset**: Vite
- **Root Directory**: `./` (项目根目录)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

⚠️ **重要**：不要修改这些自动检测的值！

### 步骤 3：配置环境变量
在 "Environment Variables" 部分添加：

#### 必需变量
| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_API_BASE` | `https://your-railway-backend.up.railway.app` | Production, Preview, Development |
| `VITE_AMAP_KEY` | 你的高德地图 Web Key | Production, Preview, Development |
| `VITE_AMAP_SECURITY_CODE` | 你的高德地图安全码 | Production, Preview, Development |

#### 可选变量
| 变量名 | 值 | 环境 |
|--------|-----|------|
| `GEMINI_API_KEY` | 你的 Gemini API Key | Production, Preview, Development |

### 步骤 4：部署
点击 "Deploy" 按钮

---

## 🐛 常见错误及解决方案

### 错误 1：构建失败 - "Command failed"
**症状**：构建日志显示 `npm run build` 失败

**解决方案**：
1. 检查本地是否能成功构建：`npm run build`
2. 检查 `package.json` 中的 `build` 脚本
3. 查看 Vercel 构建日志中的具体错误信息

### 错误 2：页面空白或 404
**症状**：部署成功但访问页面空白或显示 404

**可能原因**：
1. ❌ 环境变量未配置
2. ❌ `vercel.json` 的 rewrites 配置错误
3. ❌ 输出目录配置错误

**解决方案**：
1. 确认 `vercel.json` 包含 rewrites 配置
2. 确认 Output Directory 设置为 `dist`
3. 检查浏览器控制台的错误信息
4. 确认环境变量已正确配置

### 错误 3：API 请求失败
**症状**：页面加载但 API 调用失败

**解决方案**：
1. 确认 `VITE_API_BASE` 环境变量已配置
2. 确认 Railway 后端正在运行
3. 检查后端 CORS 配置是否允许 Vercel 域名
4. 在浏览器控制台查看具体的网络错误

### 错误 4：地图无法显示
**症状**：页面加载但地图区域空白

**解决方案**：
1. 确认 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE` 已配置
2. 在高德地图控制台检查 Key 的使用限制
3. 确认 Key 已启用 Web 服务（JS API）

### 错误 5：环境变量未生效
**症状**：代码中无法读取环境变量

**解决方案**：
1. 确认变量名以 `VITE_` 开头（Vite 要求）
2. 添加环境变量后需要重新部署
3. 在 Vercel 项目设置中确认变量已保存

---

## 🔍 调试步骤

### 1. 查看构建日志
1. 进入 Vercel 项目页面
2. 点击 "Deployments" 标签
3. 点击最新的部署
4. 展开 "Building" 部分查看详细日志

### 2. 查看运行时日志
1. 在部署详情页面
2. 点击 "Functions" 标签（如果有）
3. 查看运行时错误

### 3. 浏览器调试
1. 打开部署的网站
2. 按 F12 打开开发者工具
3. 查看 Console 标签的错误信息
4. 查看 Network 标签的请求失败信息

---

## 📝 当前配置摘要

### vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 必需的环境变量
- `VITE_API_BASE` - Railway 后端地址
- `VITE_AMAP_KEY` - 高德地图 Key
- `VITE_AMAP_SECURITY_CODE` - 高德地图安全码

---

## 🆘 如果还是不行

请提供以下信息：

1. **Vercel 构建日志**：
   - 复制完整的构建日志（特别是红色错误部分）

2. **浏览器控制台错误**：
   - 打开部署的网站
   - F12 → Console 标签
   - 截图或复制错误信息

3. **部署配置截图**：
   - Vercel 项目设置页面的截图
   - 环境变量配置的截图

4. **具体症状描述**：
   - 构建失败？
   - 页面空白？
   - 功能不正常？
   - 具体哪个功能有问题？

---

## 📞 参考资源

- Vercel 官方文档：https://vercel.com/docs
- Vite 部署指南：https://vitejs.dev/guide/static-deploy.html
- 项目部署文档：`docs/DEPLOY_VERCEL.md`
