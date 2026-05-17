# Firebase 配置指南

## 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "创建项目"
3. 输入项目名称：`coffee-inventory`（或其他名称）
4. 关闭 Google Analytics（可选），点击创建

## 2. 启用 Firestore 数据库

1. 在左侧菜单选择 "构建" → "Firestore Database"
2. 点击 "创建数据库"
3. 选择 **测试模式**（开发阶段允许读写）
4. 选择靠近你的区域（例如：`asia-east1` 或 `asia-northeast1`）

## 3. 获取配置信息

1. 进入 **项目设置**（齿轮图标）
2. 滚动到 **你的应用** 部分
3. 选择 Web 应用（</>），注册应用
4. 复制配置代码，看起来像这样：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}
```

## 4. 配置环境变量

在项目根目录创建 `.env` 文件，填入你的配置：

```env
VITE_FIREBASE_API_KEY=你的API_KEY
VITE_FIREBASE_AUTH_DOMAIN=你的项目.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的项目ID
VITE_FIREBASE_STORAGE_BUCKET=你的项目.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的发送者ID
VITE_FIREBASE_APP_ID=你的应用ID
```

## 5. 验证配置

1. 重启开发服务器
2. 刷新页面
3. 检查控制台是否有 Firebase 连接错误
4. 在 Firestore 中手动添加一条数据测试

## 6. 生产环境安全规则

测试完成后，建议更新 Firestore 安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coffeeBeans/{bean} {
      allow read, write: if request.auth != null;
    }
    match /transactions/{trans} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 注意事项

- 测试模式下任何人都可以读写数据
- 添加用户认证后可以限制访问权限
- 免费套餐足够个人使用（Firestore 每月 50GB 读取）
- 数据会自动在本地和云端同步