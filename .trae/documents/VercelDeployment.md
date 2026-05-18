# 部署到 Vercel 指南

## 第一步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. **Repository name**: `coffee-inventory`
3. **Description**: `咖啡豆库存管理系统`
4. 选择 **Private**（私有）
5. 点击 **Create repository**

## 第二步：推送代码

在项目目录执行以下命令：

```bash
# 添加远程仓库
git remote add origin https://github.com/DavidHe/coffee-inventory.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第三步：部署到 Vercel

1. 打开 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 **Add New Project**
4. 从列表中选择 `coffee-inventory` 仓库
5. 在 **Environment Variables** 添加两个变量：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://atnghqklfjuspiszanqr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_AdjGMy2ur2rjnECeVpI-_g_EVyHwNxO` |

6. 点击 **Deploy**

部署完成后，Vercel 会给你一个 URL，例如：`https://coffee-inventory.vercel.app`，手机直接访问这个地址就能用了！

## 更新代码

以后修改代码后：

```bash
git add .
git commit -m "更新说明"
git push
```

Vercel 会自动检测到更新并重新部署。