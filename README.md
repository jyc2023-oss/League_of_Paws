# League of Paws（前后端一体化宠物健康管理系统）

> 本文档面向 **从未配置过开发环境** 的使用者。按照步骤执行即可在一台全新的 Windows 电脑上完整运行项目的前端（React Native App）与后端（Node.js + MySQL）。

---

## 1. 功能概览

- 移动端 App（React Native + TypeScript）：
  - 宠物档案、健康趋势、习惯打卡、社区等页面；
  - 每日喂食/运动/体重打卡后，健康趋势图实时刷新。
- 后端服务（Node.js + Express）：
  - 登录、宠物管理、健康档案、打卡记录等 RESTful API；
  - 使用 MySQL 存储宠物、健康记录和每日打卡数据；
  - 自带自动建表/字段升级逻辑，首次运行即可使用。

---

## 2. 技术栈

| 模块 | 技术 | 说明 |
| --- | --- | --- |
| 前端 App | React Native 0.74 + TypeScript | 使用 Metro bundler，支持 Android 模拟器或真机调试 |
| 状态管理 | Zustand + Redux Toolkit | 同时利用轻量与可预测的两种状态方案 |
| 后端 | Node.js 18 + Express 5 | REST API、JWT 身份认证、中间件拆分 |
| 数据库 | MySQL 8 | 通过 `backend/config/database.js` 连接 |
| 其他 | Axios、React Navigation、react-native-chart-kit 等 | 网络请求、导航与图表 |

---

## 3. 目标读者的准备工作

> 以下步骤以 **Windows 10/11 64 位** 为例，其它系统可参考等价工具。

1. **安装 Git**  
   - 下载：https://git-scm.com/download/win  
   - 安装时保持默认选项即可。

2. **安装 Node.js 18 LTS**  
   - 下载：https://nodejs.org/en/download  
   - 安装结束后，在命令行执行 `node -v`，若输出 `v18.x.x` 即成功。

3. **安装 JDK 17（React Native Android 构建需要）**  
   - 可安装 Microsoft Build of OpenJDK：https://learn.microsoft.com/openjdk  
   - 安装后配置环境变量 `JAVA_HOME` 指向安装目录。

4. **安装 Android Studio（提供模拟器与 SDK）**  
   - 下载：https://developer.android.com/studio  
   - 安装时勾选 Android SDK、SDK Platform、Android Virtual Device（AVD）；
   - 运行 Android Studio > More Actions > SDK Manager：
     - 安装 `Android 13 (Tiramisu)` 或更高版本的 SDK；
     - 在 `SDK Tools` 中勾选 `Android SDK Platform-Tools`；
   - 通过 AVD Manager 创建一个虚拟设备（例如 Pixel 5 + Android 13）。

5. **安装 MySQL 8**  
   - 下载：https://dev.mysql.com/downloads/mysql/  
   - 安装时记住 root 密码（示例使用 `Chenjianyi666+`，可自行修改）；  
   - 勾选 “MySQL Server” 与 “MySQL Shell/Workbench”（方便管理）。

6. **安装一个文本编辑器/IDE（推荐 VS Code）**  
   - https://code.visualstudio.com

---

## 4. 克隆仓库

```bash
git clone https://github.com/<your-account>/League_of_Paws.git
cd League_of_Paws
```

> 将 `<your-account>` 替换为你的 GitHub 用户名。如果你正在阅读本 README，即已完成该步骤。

---

## 5. 后端环境配置

### 5.1 安装依赖

```bash
cd backend
npm install
```

### 5.2 配置数据库

1. 打开命令提示符（或 PowerShell），登录 MySQL：
   ```bash
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -uroot -p
   ```
2. 创建数据库并授权（如果尚未创建）：
   ```sql
   CREATE DATABASE IF NOT EXISTS my_app_db DEFAULT CHARACTER SET utf8mb4;
   USE my_app_db;
   ```
3. 确认 `backend/config/database.js` 中的配置与你的 MySQL 地址、端口、用户名、密码一致。默认示例：
   ```js
   host: 'localhost',
   user: 'root',
   password: 'Chenjianyi666+',
   database: 'my_app_db'
   ```
   如果你修改了密码，记得同步修改此文件。
4. 退出 MySQL：`EXIT;`

> 后端启动时会自动创建/升级所需表（如 `pets`、`vaccine_records`、`habit_entries` 等），无需手动导入 SQL 文件。

### 5.3 启动后端

```bash
cd backend
npm start
```

成功后终端会显示：

```
✅ 成功连接到 MySQL 数据库
✅ 后端服务器正在 http://localhost:3000 运行
```

若出现 “数据库结构升级失败” 等错误，请确认步骤 5.2 中的数据库、权限、密码均正确。

---

## 6. 前端环境配置

### 6.1 安装依赖

在仓库根目录执行：

```bash
npm install
```

> 项目使用 npm，如需使用 yarn/pnpm，可自行切换并删除 `package-lock.json`。

### 6.2 连接 Android 设备/模拟器

- 若使用 **模拟器**：打开 Android Studio → AVD Manager → 启动之前创建的虚拟设备；
- 若使用 **真机**：
  1. 在手机上开启开发者模式与 USB 调试；
  2. 使用数据线连接电脑；
  3. 在终端运行 `adb devices` 确认设备已被识别。

### 6.3 启动 Metro Bundler

```bash
npx react-native start
```

保持窗口开启，以便监听代码变化。

### 6.4 安装并运行 App

新开一个终端窗口（仍在仓库根目录）：

```bash
npm run android
```

首次构建会比较耗时（需要 Gradle 下载依赖）。成功后：

- 模拟器/真机会自动安装并打开 App；
- 若提示 “Unable to load script”，请确认后端已运行、设备网络可访问 `http://10.0.2.2:3000`（Android 模拟器）或 `http://localhost:3000`（iOS/Expo/Web）。

---

## 7. 常用脚本

| 位置 | 命令 | 作用 |
| --- | --- | --- |
| 根目录 | `npm start` | ≈ `npx react-native start`（Metro bundler） |
| 根目录 | `npm run android` / `npm run ios` | 构建并部署到 Android / iOS（iOS 需 macOS） |
| backend/ | `npm start` | 启动 Express API（默认端口 3000） |
| backend/ | `npm run test:pets` | 通过脚本快速验证 `/api/pets` 接口 |

---

## 8. 与后端联调

前端所有 API 调用都集中在 `src/services/api` 与 `src/services/api/petHealthApi.ts` 中。默认基础地址：

- Android 模拟器：`http://10.0.2.2:3000/api`
- iOS 模拟器 / Web：`http://localhost:3000/api`

如需修改，可在对应文件里更改 `API_BASE_URL`。

> 若你使用真机并连接同一局域网，请将 `API_BASE_URL` 修改为电脑的局域网 IP，例如 `http://192.168.0.12:3000/api`。

---

## 9. 数据初始化与体验建议

1. **注册 / 登录**：按照 App 的注册流程创建账号。
2. **添加宠物**：通过 “宠物管理” 页面添加至少一只宠物。
3. **健康档案**：在 `PetProfileScreen` 中完善疫苗、体检、喂食计划等信息。
4. **习惯打卡**：
   - 从首页进入 “习惯打卡”；
   - 选择日期（支持回填近 7 天数据）、勾选任务，并输入喂食量/运动时长/体重；
   - 提交后，后端会记录到 `habit_entries`，健康趋势图会重新计算。
5. **查看趋势**：进入 “健康趋势报告”，确认图表已使用刚录入的真实数据。

---

## 10. 常见问题排查

| 问题 | 可能原因 | 解决方法 |
| --- | --- | --- |
| `react-native` 运行时报 `SDK location not found` | 未安装 Android SDK，或未配置 `ANDROID_HOME` | 打开 Android Studio → SDK Manager 安装 SDK；将 `%LOCALAPPDATA%\Android\Sdk` 写入环境变量 |
| App 显示 `Network request failed` | 后端未启动 / IP 配置错误 / 端口被占用 | 确认 `npm start` 已在 backend 目录运行；必要时修改 `API_BASE_URL` |
| MySQL 连接失败 | 密码错误，或数据库未创建 | 使用 `mysql -u root -p` 登录，确认 `my_app_db` 已存在并与 `database.js` 配置匹配 |
| `数据库结构升级失败` | MySQL 版本不支持 `IF NOT EXISTS` 语法 | 已在代码中通过 `SHOW COLUMNS` 兼容，如仍报错请手动执行 README 中的 SQL |
| 构建 Android 卡在 `:app:installDebug` | 未连接设备或缺少权限 | 在终端运行 `adb devices`，若无内容，请重新连接或授权 |

---

## 11. 目录结构速览

```
├── backend
│   ├── config/           # 数据库配置 & 自动建表
│   ├── controllers/      # 业务逻辑（宠物、健康、习惯等）
│   ├── routes/           # Express 路由
│   ├── middleware/       # 认证、日志等
│   └── server.js         # 启动入口
├── src
│   ├── screens/          # 所有页面（Home、PetProfile、HealthReport、HabitCheckIn…）
│   ├── services/         # API 客户端
│   ├── store/            # Redux + Zustand
│   ├── components/       # 通用组件
│   └── theme/            # 颜色、字体、间距
└── README.md             # 本说明文档
```

---

## 12. 下一步

- 根据产品需求继续扩展页面与接口；
- 将 `backend` 部署到云服务器（可包装为 Docker 镜像）；
- 配置 CI/CD（GitHub Actions）实现自动测试与构建；
- 引入 Expo 或 CodePush 提升 OTA 更新效率；
- 为 MySQL 增加真实的迁移工具（如 Prisma、Knex、Flyway），便于多人协作。

如在搭建过程中遇到任何报错，可将完整日志与运行命令反馈至项目 Issue，我们会协助定位。祝使用顺利！🐾
