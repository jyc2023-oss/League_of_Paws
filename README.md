# 汪者荣耀 React Native 基础框架

该项目为《汪者荣耀》移动端应用的前端基础框架，技术栈为 **React Native + TypeScript + Zustand + Redux Toolkit**，并预留了导航、状态管理、服务调用等关键模块的骨架。

## 项目结构

```
├── App.tsx                # 应用入口，集成导航与状态容器
├── app.json               # React Native 应用定义
├── backend                # Node.js + Express 后端
│   ├── config             # 数据库与运行配置
│   ├── controllers        # 登录、宠物等业务控制器
│   ├── middleware         # 全局中间件与工具
│   ├── routes             # /api/auth、/api/pets 路由
│   ├── utils              # JWT 等工具函数
│   └── server.js          # 后端启动入口
├── index.js               # 注册原生入口
├── package.json           # 前端依赖与脚本
├── src
│   ├── components         # 可复用组件
│   ├── hooks              # 自定义 Hook
│   ├── navigation         # 路由配置与类型定义
│   ├── screens            # 页面组件
│   ├── services           # API 客户端等服务封装
│   ├── store              # Zustand / Redux 状态管理
│   ├── theme              # 主题、色板、间距等设计变量
│   └── utils              # 工具与常量
└── tsconfig.json
```

## 接下来可以做什么？

### 前端（React Native）

1. 执行 `npm install` / `yarn install` 安装依赖。
2. 按平台运行：
   - `npm run android` / `npm run ios`
3. 根据产品需求补充页面与业务逻辑：健康档案、圈子动态、救助与配对等模块。
4. 在 `src/store` 中扩展数据切片（Redux）或领域 store（Zustand），将其与各页面联动。

### 后端（Node.js + Express）

1. `cd backend && npm install`
2. 根据 `backend/config/database.js` 配置数据库连接。
3. 运行 `npm start` 启动接口服务（默认 `http://localhost:3000`）。
4. 通过 `npm run test:pets` 快速验证 `/api/pets` 接口是否可用。

> 当前部分模块仅为占位示例，请结合后续接口与设计稿继续完善。
