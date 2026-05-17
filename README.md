# Coffee Inventory - 咖啡豆库存管理系统

咖啡豆库存管理应用，支持多设备同步、新鲜度追踪、快捷添加等功能。

## 功能特性

- 📦 库存追踪 - 记录咖啡豆进出库
- 🔥 新鲜度监控 - 根据最佳饮用期计算状态
- ✂️ 快捷添加 - 粘贴咖啡豆信息自动解析
- ☁️ 云端同步 - 支持多设备访问（Supabase）
- 📱 响应式设计 - 手机和电脑都能用

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase

## 开始使用

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 填入 Supabase 配置

# 开发模式
npm run dev

# 构建
npm run build
```

## 环境变量

```env
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的API密钥
```