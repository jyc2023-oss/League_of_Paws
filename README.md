# 汪者荣耀 React Native 基础框架

该项目为《汪者荣耀》移动端应用的前端基础框架，技术栈为 **React Native + TypeScript + Zustand + Redux Toolkit**，并预留了导航、状态管理、服务调用等关键模块的骨架。

## 项目结构

```
├── App.tsx                # 应用入口，集成导航与状态容器
├── app.json               # React Native 应用定义
├── index.js               # 注册原生入口
├── package.json           # 依赖与脚本
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

1. 执行 `npm install` / `yarn install` 安装依赖。
2. 按平台运行：
   - `npm run android` / `npm run ios`
3. 根据产品需求补充页面与业务逻辑：健康档案、圈子动态、救助与配对等模块。
4. 在 `src/store` 中扩展数据切片（Redux）或领域 store（Zustand），将其与各页面联动。

> 当前部分模块仅为占位示例，请结合后续接口与设计稿继续完善。
