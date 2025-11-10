# 宠物建档功能测试指南

## 前置准备

### 1. 确保数据库已设置

首先需要创建数据库表结构。在MySQL中执行：

```bash
mysql -u root -p my_app_db < database/schema.sql
```

或者直接在MySQL客户端中执行 `database/schema.sql` 文件中的SQL语句。

### 2. 检查数据库配置

确认 `config/database.js` 中的数据库连接信息正确：
- host: localhost
- user: root
- password: 您的MySQL密码
- database: my_app_db

### 3. 安装依赖（如果还没安装）

```bash
cd D:\my-app-backend
npm install
```

## 测试方法

### 方法1: 使用自动化测试脚本（推荐）

#### 步骤1: 启动后端服务器

在一个终端窗口中：

```bash
cd D:\my-app-backend
npm start
# 或
node server.js
```

应该看到：
```
✅ 成功连接到 MySQL 数据库
✅ 后端服务器正在 http://localhost:3000 运行
```

#### 步骤2: 运行测试脚本

在另一个终端窗口中：

```bash
cd D:\my-app-backend
npm run test:pets
# 或
node test-pets-api.js
```

测试脚本会自动执行以下测试：
1. ✅ 注册用户获取Token
2. ✅ 创建宠物档案
3. ✅ 获取宠物列表
4. ✅ 获取宠物健康档案
5. ✅ 测试错误处理（无Token、缺少字段、无效值等）

### 方法2: 使用 Postman 或类似工具

#### 步骤1: 启动后端服务器

```bash
cd D:\my-app-backend
npm start
```

#### 步骤2: 创建新请求

**1. 注册用户获取Token**

- **方法**: POST
- **URL**: `http://localhost:3000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "name": "测试用户",
  "email": "test@example.com",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "user": {
    "id": 1,
    "name": "测试用户",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. 创建宠物档案**

- **方法**: POST
- **URL**: `http://localhost:3000/api/pets`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <刚才获取的token>`
- **Body** (JSON):
```json
{
  "name": "可可",
  "species": "dog",
  "ageInMonths": 18
}
```

**响应示例**:
```json
{
  "id": "1",
  "name": "可可",
  "species": "dog",
  "ageInMonths": 18
}
```

**3. 获取宠物列表**

- **方法**: GET
- **URL**: `http://localhost:3000/api/pets`
- **Headers**: 
  - `Authorization: Bearer <token>`

**4. 获取宠物健康档案**

- **方法**: GET
- **URL**: `http://localhost:3000/api/pets/1/health`
- **Headers**: 
  - `Authorization: Bearer <token>`

**响应示例**:
```json
{
  "id": "1",
  "name": "可可",
  "species": "犬",
  "breed": "未填写",
  "age": 1,
  "weightKg": 0,
  "vaccines": [],
  "checkups": [],
  "allergies": [],
  "feedingPlan": {
    "food": "",
    "caloriesPerMeal": 0,
    "schedule": [],
    "notes": null
  },
  "exerciseRecords": []
}
```

### 方法3: 使用 curl 命令

**1. 注册用户**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"测试用户\",\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

**2. 创建宠物** (替换 `<TOKEN>` 为实际token)
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d "{\"name\":\"可可\",\"species\":\"dog\",\"ageInMonths\":18}"
```

**3. 获取宠物列表**
```bash
curl -X GET http://localhost:3000/api/pets \
  -H "Authorization: Bearer <TOKEN>"
```

**4. 获取健康档案**
```bash
curl -X GET http://localhost:3000/api/pets/1/health \
  -H "Authorization: Bearer <TOKEN>"
```

### 方法4: 在前端应用中测试

1. 确保后端服务器运行在 `http://localhost:3000`
2. 确保前端代码中的 `petHealthApi.ts` baseURL 已设置为 `http://localhost:3000/api`
3. 在前端应用中：
   - 注册/登录获取token
   - 进入宠物引导页面（PetOnboardingScreen）
   - 填写宠物信息并提交
   - 查看宠物档案页面（PetProfileScreen）

## 常见问题排查

### 1. 数据库连接失败

**错误**: `❌ 数据库连接失败`

**解决**:
- 检查MySQL服务是否运行
- 检查 `config/database.js` 中的连接信息
- 确认数据库 `my_app_db` 已创建

### 2. 401 Unauthorized

**错误**: `需要身份验证，请先登录`

**解决**:
- 确保请求头中包含 `Authorization: Bearer <token>`
- 检查token是否有效（未过期）
- 如果token过期，重新注册/登录获取新token

### 3. 404 Not Found

**错误**: `未找到该宠物档案`

**解决**:
- 检查petId是否正确
- 确认该宠物属于当前登录用户
- 确保已创建该宠物

### 4. 表不存在错误

**错误**: `Table 'my_app_db.pets' doesn't exist`

**解决**:
- 执行 `database/schema.sql` 创建所有表
- 检查数据库名称是否正确

## 预期测试结果

✅ **成功情况**:
- 注册用户返回201状态码和token
- 创建宠物返回201状态码和宠物信息
- 获取宠物列表返回200状态码和宠物数组
- 获取健康档案返回200状态码和完整健康数据

❌ **错误情况**:
- 无Token: 401 Unauthorized
- 缺少必填字段: 400 Bad Request
- 无效的species值: 400 Bad Request
- 宠物不存在: 404 Not Found

## 数据库验证

测试完成后，可以在MySQL中验证数据：

```sql
-- 查看所有宠物
SELECT * FROM pets;

-- 查看特定用户的宠物
SELECT * FROM pets WHERE user_id = 1;

-- 查看疫苗记录
SELECT * FROM vaccine_records;
```

