# Community Feature（社区灵感）

社区灵感功能，展示真实游客的旅行故事和文化体验。

## 文件结构

```
community/
├── CommunityPage.tsx          # 页面容器
├── community.data.ts          # 数据类型和 Mock 数据
├── hooks/
│   └── useCommunityData.ts   # 数据状态管理（筛选逻辑）
├── components/
│   ├── PostCard.tsx           # 帖子卡片组件
│   ├── FilterBar.tsx          # 标签筛选栏
│   └── PostDetailModal.tsx    # 帖子详情模态框
└── README.md
```

## 功能特性

### 1. 瀑布流布局
- 双列自适应布局（CSS columns）
- 卡片高度根据内容自动调整
- 响应式设计

### 2. 标签筛选
- 9 个预设标签分类
- 点击标签筛选对应帖子
- "全部"选项显示所有帖子

### 3. 帖子卡片
- 4:5 竖版图片
- 用户信息 + 国旗 emoji
- 点赞/评论数
- 位置标记
- 文化提示 badge
- Hover 动画效果

### 4. 详情模态框
- 点击卡片打开详情
- 完整内容展示
- 大图预览
- 点击背景关闭

## 数据结构

### CommunityPost
```typescript
{
  id: string;
  title: string;
  user: { name, country, avatar };
  timestamp: string;
  content: string;
  tags: string[];
  location: string;
  cost: string;
  culturalTip: string;
  image: string;
  pillar: string;
  likes: number;
  comments: number;
}
```

## 使用方式

### 基础使用
```tsx
import { CommunityPage } from '@/features/community/CommunityPage';

<CommunityPage />
```

### 自定义数据
修改 `community.data.ts` 中的 `MOCK_POSTS` 数组，或通过 API 获取真实数据。

## 样式设计

### 色彩方案
- 主色：`#dc2626`（印章红）
- 背景：`#fafaf9`（纸张白）
- 文字：`#1c1917`（墨色）
- 辅助：`#78716c`（灰色）

### 动画效果
- 卡片 Hover：上浮 2px + 阴影加深
- 按钮 Hover：颜色变化
- 模态框：淡入 + 背景模糊

### 真实感细节
- 图片 sepia 滤镜（5%）
- 纸张纹理背景
- 衬线字体标题
- 文化提示 badge

## 后续优化

### P1（体验优化）
- [ ] 图片懒加载
- [ ] 骨架屏加载
- [ ] 无限滚动
- [ ] 点赞/评论交互

### P2（高级功能）
- [ ] 用户关注系统
- [ ] 评论功能
- [ ] 分享功能
- [ ] 搜索功能

## 技术栈

- React + TypeScript
- CSS Columns（瀑布流）
- Lucide Icons
- Tailwind CSS

---

**创建时间**：2026/01/23  
**版本**：v1.0
