# 宠物建档与引导 API 文档

## 概述

本文档描述了宠物建档与引导相关的后端API接口。所有接口都需要JWT认证。

## 认证方式

所有请求需要在请求头中包含JWT token：

```
Authorization: Bearer <your_jwt_token>
```

## API 端点

### 1. 创建宠物档案

**POST** `/api/pets`

创建新的宠物档案。

#### 请求体

```json
{
  "name": "可可",
  "species": "dog",  // 可选值: "dog", "cat", "other"
  "ageInMonths": 18,  // 可选
  "avatarUrl": "https://example.com/avatar.jpg"  // 可选
}
```

#### 响应

**201 Created**

```json
{
  "id": "1",
  "name": "可可",
  "species": "dog",
  "ageInMonths": 18,
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**400 Bad Request** - 缺少必填字段或无效的species值

```json
{
  "message": "请填写宠物昵称和物种"
}
```

**401 Unauthorized** - 未提供token

```json
{
  "message": "需要身份验证，请先登录"
}
```

### 2. 获取用户的所有宠物列表

**GET** `/api/pets`

获取当前用户的所有宠物列表。

#### 响应

**200 OK**

```json
[
  {
    "id": "1",
    "name": "可可",
    "species": "dog",
    "ageInMonths": 18,
    "avatarUrl": "https://example.com/avatar.jpg"
  }
]
```

### 3. 获取宠物健康档案

**GET** `/api/pets/:petId/health`

获取指定宠物的完整健康档案。

#### 路径参数

- `petId` - 宠物ID

#### 响应

**200 OK**

```json
{
  "id": "1",
  "name": "可可",
  "species": "犬",
  "breed": "柯基",
  "age": 1,
  "weightKg": 11.2,
  "vaccines": [
    {
      "id": "1",
      "name": "狂犬疫苗",
      "date": "2024-09-12",
      "clinic": "城市宠物医院",
      "vet": "陈医生",
      "notes": "加强针，反应轻微"
    }
  ],
  "checkups": [
    {
      "id": "1",
      "date": "2024-09-12",
      "clinic": "城市宠物医院",
      "vet": "陈医生",
      "summary": "身体状况良好，建议控制体重",
      "weightKg": 11.2
    }
  ],
  "allergies": [
    {
      "id": "1",
      "allergen": "鸡肉",
      "reaction": "皮肤瘙痒",
      "severity": "medium",
      "notes": "换粮后症状改善"
    }
  ],
  "feedingPlan": {
    "food": "低敏三文鱼配方",
    "caloriesPerMeal": 320,
    "schedule": ["07:30", "12:30", "18:30"],
    "notes": "喂食时加入益生菌"
  },
  "exerciseRecords": [
    {
      "id": "1",
      "date": "2024-10-20",
      "activity": "慢跑",
      "durationMinutes": 30,
      "intensity": "medium"
    }
  ]
}
```

**404 Not Found** - 宠物不存在或不属于当前用户

```json
{
  "message": "未找到该宠物档案"
}
```

## 数据库设置

在运行API之前，需要先执行数据库schema创建脚本：

```bash
mysql -u root -p my_app_db < database/schema.sql
```

或者直接在MySQL客户端中执行 `database/schema.sql` 文件中的SQL语句。

## 注意事项

1. 所有API都需要JWT认证
2. 端口默认设置为3000，如果前端需要不同的端口，请修改 `server.js` 中的 `PORT` 变量
3. 前端的 `petHealthApi.ts` 中baseURL设置为 `http://localhost:4000/api`，如果使用本后端，需要修改为 `http://localhost:3000/api`
4. 创建宠物时，如果宠物没有健康档案数据（疫苗、体检等），会返回空数组或默认值

