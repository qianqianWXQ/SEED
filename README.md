# 任务管理平台

## 项目简介

这是一个基于 Next.js 的现代化任务协作平台，提供完整的用户认证和任务管理功能。该平台旨在帮助团队高效地组织和跟踪工作任务，提升协作效率。

## 功能特性

### 已实现功能

- **用户认证系统**
  - 用户注册（邮箱、密码、确认密码）
  - 用户登录（邮箱、密码验证）
  - 会话管理和登出功能
  - 用户角色基础框架

- **任务管理功能**
  - 任务创建和管理
  - 任务状态跟踪（待处理、进行中、已完成）
  - 任务优先级设置（低、中、高、紧急）
  - 任务截止日期管理

- **项目管理**
  - 基础项目结构
  - 用户与任务的关联关系

- **界面组件**
  - 基于现代化 UI 组件的响应式界面
  - 表单验证和错误处理
  - 用户友好的交互体验

## 技术栈

### 前端技术

| 技术/框架 | 版本 | 用途 |
|----------|------|------|
| Next.js | 15.5.6 | 全栈 React 框架 |
| React | 18+ | UI 库 |
| TypeScript | 5+ | 静态类型检查 |
| CSS Modules | - | 组件样式管理 |

### 后端技术

| 技术/框架 | 版本 | 用途 |
|----------|------|------|
| Next.js API Routes | 15.5.6 | 服务器端 API 处理 |
| Node.js | 20+ | JavaScript 运行时 |

### 数据库与 ORM

| 技术/框架 | 版本 | 用途 |
|----------|------|------|
| SQLite | - | 轻量级关系型数据库 |
| Prisma | 6.18.0 | Node.js 和 TypeScript ORM |

### 安全与认证

| 技术/框架 | 版本 | 用途 |
|----------|------|------|
| bcrypt | - | 密码哈希和验证 |
| HTTP-only Cookies | - | 安全的会话管理 |

## 项目结构

```
seed/
├── app/                 # Next.js App Router 目录
│   ├── api/             # API 路由处理
│   │   ├── auth/        # 认证相关 API
│   │   └── users/       # 用户相关 API
│   ├── auth/            # 认证页面（登录、注册）
│   └── components/      # 页面级组件
├── src/
│   ├── generated/       # 自动生成的代码（如 Prisma 客户端）
│   └── lib/             # 工具函数和配置
│       └── prisma.ts    # Prisma 客户端配置
├── prisma/              # 数据库 schema 和迁移
│   ├── schema.prisma    # 数据库模型定义
│   ├── migrations/      # 数据库迁移文件
│   └── dev.db           # SQLite 数据库文件
├── public/              # 静态资源文件
├── package.json         # 项目依赖和脚本
└── next.config.ts       # Next.js 配置
```

### 主要目录说明

- **app/**: Next.js App Router 目录，包含所有页面和 API 路由
- **src/lib/**: 工具函数、配置和辅助模块
- **prisma/**: 数据库相关配置、schema 定义和迁移文件
- **public/**: 静态资源，如图片、图标和字体

## 安装指南

### 环境要求

- Node.js 20.x 或更高版本
- npm、yarn 或 pnpm 包管理器

### 安装步骤

1. **克隆项目并进入目录**

```bash
git clone <repository-url>
cd seed
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **数据库设置**

初始化数据库并应用迁移：

```bash
npx prisma migrate dev
```

4. **环境配置**

创建 `.env` 文件（如果不存在）并配置必要的环境变量：

```
# 数据库连接 URL（已通过代码动态配置，此配置为可选）
DATABASE_URL="file:./prisma/dev.db"

# 会话密钥（用于生产环境）
SECRET_KEY="your-secret-key-here"
```

5. **启动开发服务器**

```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 React 和 Next.js 最佳实践
- 组件命名使用 PascalCase
- 函数和变量命名使用 camelCase
- 使用 CSS Modules 进行样式管理

### 开发流程

1. **创建新功能分支**

```bash
git checkout -b feature/your-feature-name
```

2. **开发和测试**

- 运行开发服务器：`npm run dev`
- 进行代码修改和功能开发
- 确保所有功能正常工作

3. **数据库更改**

如果需要修改数据库模型：

```bash
# 修改 prisma/schema.prisma 后运行
npx prisma migrate dev --name your-migration-name
```

4. **提交代码**

```bash
git add .
git commit -m "描述你的更改"
git push origin feature/your-feature-name
```

## 部署说明

### 部署到 Vercel

1. **准备工作**

- 确保项目已推送到 GitHub 或其他 Git 仓库
- 确保已创建 Vercel 账号

2. **部署步骤**

- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 点击 "New Project"
- 导入你的 Git 仓库
- 配置项目设置（环境变量等）
- 点击 "Deploy"

### 环境变量配置

生产环境中需要配置的环境变量：

```
# 生产环境数据库连接 URL
DATABASE_URL="your-production-database-url"

# 会话密钥
SECRET_KEY="your-secure-secret-key"
```

### 数据库迁移

部署前确保执行数据库迁移：

```bash
npx prisma migrate deploy
```

## 许可证

[MIT](LICENSE)

## 贡献

欢迎提交 Issues 和 Pull Requests！
