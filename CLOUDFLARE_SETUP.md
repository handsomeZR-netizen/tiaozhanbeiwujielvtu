# Cloudflare Workers 反向代理配置指南

## 为什么需要这个？

Railway 在国内访问不稳定，经常需要梯子。通过 Cloudflare Workers 反向代理，可以让国内用户通过 CDN 访问后端，大幅提升速度和稳定性。

## 架构说明

```
用户浏览器
    ↓
https://xzr5.top (前端 - Vercel + Cloudflare CDN)
    ↓
https://api.xzr5.top (Cloudflare Worker)
    ↓
https://tiaozhanbeiwujielvtu-production.up.railway.app (后端 - Railway)
```

## 部署步骤

### 1. 创建 Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create Application**
4. 选择 **Create Worker**
5. 选择 **"从 Hello World! 开始"** 或 **"Hello World! 开始"**
6. 给 Worker 命名：`railway-proxy` 或 `api-proxy`
7. 点击 **Deploy** 或 **部署**

### 2. 编辑 Worker 代码

1. 部署后，点击 **Edit Code** 或 **编辑代码**
2. 删除所有默认代码
3. 复制 `cloudflare-worker.js` 文件中的代码
4. 粘贴到编辑器中
5. 确认 `RAILWAY_URL` 是你的实际 Railway 地址：
   ```javascript
   const RAILWAY_URL = 'https://tiaozhanbeiwujielvtu-production.up.railway.app';
   ```
6. 点击 **Save and Deploy** 或 **保存并部署**

### 3. 绑定自定义域名

1. 回到 Worker 页面
2. 点击 **Settings** 或 **设置**
3. 找到 **Triggers** 或 **触发器** 标签
4. 在 **Custom Domains** 部分，点击 **Add Custom Domain** 或 **添加自定义域名**
5. 输入：`api.xzr5.top`
6. 点击 **Add Custom Domain** 或 **添加**

Cloudflare 会自动添加 DNS 记录，通常几分钟内生效。

### 4. 配置 Vercel 环境变量

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 进入你的项目
3. 点击 **Settings** → **Environment Variables**
4. 添加或修改以下变量：

```
VITE_API_BASE=https://api.xzr5.top
VITE_AMAP_KEY=29658f0aff496deade6632d1a388af96
VITE_AMAP_SECURITY_CODE=d6cc13afc7238d1c70547dfcc66496af
```

5. 点击 **Save**

### 5. 重新部署

环境变量修改后，Vercel 会自动触发重新部署。如果没有，手动触发：

1. 进入 **Deployments** 标签
2. 点击最新部署右侧的 **...** 菜单
3. 选择 **Redeploy**

## 测试验证

### 1. 测试 Worker 是否工作

在浏览器访问：
```
https://api.xzr5.top/health
```

应该返回类似：
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T..."
}
```

### 2. 测试前端是否连接成功

1. 访问 `https://xzr5.top`
2. 打开浏览器开发者工具（F12）
3. 查看 Network 标签
4. 登录或使用功能
5. 检查 API 请求是否指向 `api.xzr5.top`

## 故障排查

### Worker 返回 502 错误

**原因：** Railway 后端地址错误或后端未启动

**解决：**
1. 检查 Worker 代码中的 `RAILWAY_URL` 是否正确
2. 访问 Railway Dashboard 确认后端正在运行
3. 直接访问 Railway 地址测试是否可用

### 域名无法访问

**原因：** DNS 未生效

**解决：**
1. 等待 5-10 分钟
2. 使用 `nslookup api.xzr5.top` 检查 DNS
3. 清除浏览器缓存

### CORS 错误

**原因：** Worker 代码中 CORS 头配置问题

**解决：**
1. 确认使用了提供的完整 Worker 代码
2. 检查 `Access-Control-Allow-Origin` 是否设置为 `*`

## 性能优化建议

### 1. 启用 Cloudflare 缓存（可选）

在 Worker 代码中添加缓存策略：

```javascript
// 对于 GET 请求，缓存 5 分钟
if (request.method === 'GET') {
  modifiedResponse.headers.set('Cache-Control', 'public, max-age=300');
}
```

### 2. 监控 Worker 性能

1. 进入 Worker 页面
2. 查看 **Metrics** 或 **指标** 标签
3. 监控请求数、错误率、延迟等

## 成本说明

Cloudflare Workers 免费套餐：
- 每天 100,000 次请求
- 对于个人项目完全够用
- 超出后按量付费：$0.50 / 百万请求

## 下一步

完成配置后：
1. ✅ 前端通过 Cloudflare CDN 加速
2. ✅ 后端通过 Cloudflare Workers 代理
3. ✅ 国内用户访问速度大幅提升
4. ✅ 无需梯子即可正常使用

## 相关文件

- `cloudflare-worker.js` - Worker 代码
- `.env.vercel.example` - Vercel 环境变量示例
- `.env.local` - 本地开发环境变量

## 技术支持

如有问题，检查：
1. Cloudflare Worker 日志
2. Railway 后端日志
3. Vercel 部署日志
4. 浏览器控制台错误
