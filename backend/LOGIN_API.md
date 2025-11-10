# 登录API说明

## 新增功能

已成功添加用户登录功能，现在前端可以通过API从数据库验证用户并登录。

## API端点

### POST /api/auth/login

用户登录接口

#### 请求体

```json
{
  "email": "333",
  "password": "your_password"
}
```

#### 成功响应 (200 OK)

```json
{
  "user": {
    "id": 1,
    "name": "用户名",
    "email": "333",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 错误响应

**400 Bad Request** - 缺少必填字段
```json
{
  "message": "请填写邮箱和密码"
}
```

**401 Unauthorized** - 邮箱或密码错误
```json
{
  "message": "邮箱或密码错误"
}
```

## 前端改动

### 1. LoginScreen.tsx
- ✅ 添加了密码输入框
- ✅ 使用 `loginUserAsync` 调用后端API
- ✅ 添加了加载状态显示
- ✅ 显示错误信息（来自后端API或本地验证）

### 2. userSlice.ts
- ✅ 添加了 `loginUserAsync` 异步Thunk
- ✅ 登录成功后将用户添加到accounts数组
- ✅ 存储JWT token
- ✅ 处理登录错误状态

## 使用说明

1. **后端服务器运行在**: `http://localhost:3000`
2. **前端API地址**: 
   - Android模拟器: `http://10.0.2.2:3000/api/auth/login`
   - iOS模拟器/Web: `http://localhost:3000/api/auth/login`

3. **测试登录**:
   - 使用数据库中存在的邮箱（如"333"）
   - 输入对应的密码
   - 点击"立即登录"按钮

## 注意事项

1. **密码验证**: 登录时会验证数据库中存储的加密密码
2. **邮箱匹配**: 邮箱不区分大小写（会自动转换为小写）
3. **Token存储**: 登录成功后，JWT token会存储在Redux state中
4. **错误处理**: 如果邮箱或密码错误，会显示友好的错误提示

## 数据库要求

确保数据库中的用户记录包含：
- `email`: 邮箱地址
- `password_hash`: bcrypt加密的密码哈希

## 测试步骤

1. 确保后端服务器运行
2. 确认数据库中有用户记录（邮箱为"333"）
3. 在前端应用中输入邮箱和密码
4. 点击登录按钮
5. 如果登录成功，会自动跳转到主页或宠物引导页面

