# 后端 API 文档（Mock + 可切换）

## 基本信息
- Base URL: `http://localhost:8787`
- 统一响应：`{ ok: boolean, data?: any, error?: string }`
- Mock 开关：`MOCK_MODE=true`（`.env.server`）

## 用户档案
### GET /users/me
返回当前用户档案（若未设置则返回默认值）。

### POST /users/profile
请求体：
```json
{
  "name": "Traveler",
  "originCountry": "法国",
  "destinationCity": "北京",
  "interests": ["美食"],
  "impressionTags": ["历史"]
}
```

## 旅途日记
### GET /diaries
返回日记列表。

### GET /diaries/:id
返回单条日记详情。

### POST /diaries
请求体：
```json
{
  "title": "初见北京",
  "content": "第一次看到故宫。",
  "mediaUrls": ["https://..."],
  "location": "北京",
  "tags": ["#历史"]
}
```

### PATCH /diaries/:id
请求体（可选字段）：
```json
{
  "title": "更新标题",
  "content": "更新内容",
  "mediaUrls": ["https://..."],
  "location": "北京",
  "tags": ["#城市漫步"]
}
```

### DELETE /diaries/:id
删除日记并返回 `{ id }`。

## 海报生成（豆包生图）
### GET /posters?limit=20
返回海报生成历史（按时间倒序）。

### POST /posters/generate
请求体：
```json
{
  "city": "合肥",
  "theme": "文化地标",
  "style": "国潮",
  "language": "bilingual",
  "platform": "Instagram",
  "size": "1024x1024",
  "keywords": ["夜景", "徽派建筑"],
  "prompt": "夜色下的徽派街巷，暖色灯笼光影",
  "promptPolished": "暖灯下的徽派街巷夜景",
  "copyTitlePolished": "合肥路",
  "copySubtitlePolished": "徽风夜色"
}
```
返回生成的海报记录（含 imageUrl / copyTitle / copySubtitle / shareZh / shareEn）。

### POST /posters/polish
请求体与 `/posters/generate` 相同，用于文案润色。
```json
{
  "city": "合肥",
  "theme": "文化地标",
  "style": "国潮",
  "language": "bilingual",
  "platform": "Instagram",
  "size": "1024x1024",
  "keywords": ["夜景", "徽派建筑"],
  "prompt": "夜色下的徽派街巷，暖色灯笼光影"
}
```
返回润色结果（copyTitlePolished / copySubtitlePolished / promptPolished）。

### DELETE /posters/:id
删除海报历史记录并返回 `{ id }`。

## 社区
### GET /community/feed
返回 Mock + 用户发布混合流（最多 20 条）。

### POST /community/posts
请求体：
```json
{
  "user": "Sarah (UK)",
  "title": "茶不只是饮料，也是生活艺术。",
  "img": "https://...",
  "tags": ["#茶文化"],
  "location": "北京"
}
```

## 图鉴收藏与打卡
### GET /atlas/favorites
返回收藏列表。

### POST /atlas/favorites
请求体：
```json
{
  "poi": { "id": "poi_1", "name": "天安门广场", "lng": 116.39, "lat": 39.90 },
  "remove": false
}
```

### GET /atlas/checkins
返回打卡列表。

### POST /atlas/checkins
请求体：
```json
{
  "poi": { "id": "poi_2", "name": "前门大街", "lng": 116.40, "lat": 39.89 }
}
```

## 地图服务（Mock 可切换）
### GET /map/poi?city=北京&keyword=咖啡&location=lng,lat&radius=2000
- Mock：返回固定推荐点
- Real：优先调用高德周边搜索（place/around），若无 location 则用关键字搜索（place/text）

### GET /map/route?from=lng,lat&to=lng,lat&mode=walking|driving|transit
- Mock：返回固定路径
- Real：调用高德步行路线

### GET /map/weather?city=北京
- Mock：返回固定天气
- Real：调用高德天气

### GET /map/geocode?address=天安门广场
- Mock：返回固定坐标
- Real：调用高德地理编码

### GET /map/regeo?location=lng,lat
- Mock：返回固定城市
- Real：调用高德逆地理编码

## AI 流水线（Mock 可切换）
### POST /ai/culture
请求体：
```json
{
  "imageUrl": "https://...",
  "preferences": ["建筑与街巷", "民俗与节庆"]
}
```
- Mock：返回固定文化识别结果
- Real：Doubao 多模态识别 + 文化意象结构化输出
- 支持 data URL（服务端会暂存为 /uploads 并转换为可访问 URL）

### POST /ai/scene
请求体：`{ "text": "描述图片", "imageUrl": "https://..." }`
- Mock：返回固定场景
- Real：Doubao 多模态识别

### POST /ai/context
请求体：`{ "text": "解释广场舞" }`
- Mock：返回固定文化解码
- Real：DeepSeek 文本生成

### POST /ai/image
请求体：`{ "prompt": "城市夜景" }`
- Mock：返回固定图片地址
- Real：Doubao 文生图

### POST /ai/tags
请求体：`{ "text": "中国城市夜景" }`
- Mock：返回固定标签
- Real：DeepSeek 生成标签

## 分享（可伪造）
### POST /share
- Mock：返回固定分享卡片
- Real：仍返回固定卡片（占位）

## 审核（可伪造）
### POST /moderation
- Mock/Real：返回 `approved` 占位结果

## 环境变量
```
PORT=8787
HOST=0.0.0.0
MOCK_MODE=true
PUBLIC_BASE_URL=http://localhost:8787
AMAP_WEB_SERVICE_KEY=your_amap_web_service_key
DEEPSEEK_API_KEY=your_deepseek_api_key
ARK_API_KEY=your_ark_api_key
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=boundless_lens
```
