// 文件路径: src/store/redux/slices/authSlice.ts

import {
  createSlice,
  nanoid,
  PayloadAction,
  createAsyncThunk, // (新增) 引入
} from '@reduxjs/toolkit';
import axios from 'axios'; // (新增) 引入

// --- 1. 您的原始类型 (全部保留) ---
export type UserRole = 'normal' | 'senior';

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  petsCount: number;
  hasCompletedProfile: boolean;
};

// 这是您原始的 RegisterPayload，但我们的 API 需要密码
// type RegisterPayload = {
//   name: string;
//   email: string;
// };

type LoginPayload = {
  email: string;
};

type PromotePayload = {
  userId: string;
  targetRole: UserRole;
};

type AccountUpdatePayload = {
  userId: string;
  petsCount?: number;
  hasCompletedProfile?: boolean;
};

// --- 2. (新增) API 相关类型 ---

// API 注册时发送的数据
type RegisterData = {
  name: string;
  email: string;
  password: string;
};

// API 登录时发送的数据
type LoginData = {
  email: string;
  password: string;
};

// API 成功返回的 User 对象 (来自 MySQL)
type BackendUser = {
  id: number; // 注意: MySQL ID 是 number
  name: string;
  email: string;
  createdAt: string;
};

// API 成功返回的完整响应
type AuthResponse = {
  user: BackendUser;
  token: string;
};

// --- 3. (修改) 您的 AuthState，添加 API 状态 ---
export type AuthState = {
  accounts: UserAccount[];
  activeUserId?: string;
  // (新增)
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
};

// --- 4. (修改) 您的 initialState，添加新字段 ---
const initialState: AuthState = {
  accounts: [],
  activeUserId: undefined,
  // (新增)
  token: null,
  status: 'idle',
  error: null,
};

// --- 5. (新增) 注册用户的异步 Thunk ---
// (API 地址 - Android 模拟器请使用 10.0.2.2)
const API_URL = 'http://10.0.2.2:3000/api/auth/register';
const LOGIN_API_URL = 'http://10.0.2.2:3000/api/auth/login';

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: string }
>(
  'auth/register', // Action type
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, userData);
      return response.data; // 返回 { user: {...}, token: "..." }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- 5.1 (新增) 登录用户的异步 Thunk ---
export const loginUserAsync = createAsyncThunk<
  AuthResponse,
  LoginData,
  { rejectValue: string }
>(
  'auth/login', // Action type
  async (loginData, thunkAPI) => {
    try {
      const response = await axios.post(LOGIN_API_URL, loginData);
      return response.data; // 返回 { user: {...}, token: "..." }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- 6. 您的 authSlice (已修改) ---
const ensureAccountMutable = (
  accounts: UserAccount[],
  userId: string
): UserAccount | undefined => accounts.find(account => account.id === userId);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // (移除) 您的 'registerUser' Reducer
    // 我们不再需要它，因为注册逻辑已移至下面的 extraReducers

    // (保留) 您的 'loginUser' Reducer (这仍然是本地的，我们稍后也需要将其改为异步)
    loginUser(state, action: PayloadAction<LoginPayload>) {
      const {email} = action.payload;
      const existingAccount = state.accounts.find(
        account =>
          account.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (existingAccount) {
        state.activeUserId = existingAccount.id;
      }
    },
    // (保留) 您的所有其他 Reducers
    logout(state) {
      state.activeUserId = undefined;
      // (新增) 登出时也清除 token 和状态
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
    promoteUser(state, action: PayloadAction<PromotePayload>) {
      const {targetRole, userId} = action.payload;
      const account = ensureAccountMutable(state.accounts, userId);

      if (account) {
        account.role = targetRole;
      }

      if (state.activeUserId === userId) {
        state.activeUserId = userId;
      }
    },
    updateAccountDetails(state, action: PayloadAction<AccountUpdatePayload>) {
      const {userId, petsCount, hasCompletedProfile} = action.payload;
      const account = ensureAccountMutable(state.accounts, userId);

      if (account) {
        if (typeof petsCount === 'number') {
          account.petsCount = petsCount;
        }
        if (typeof hasCompletedProfile === 'boolean') {
          account.hasCompletedProfile = hasCompletedProfile;
        }
      }
    }
  },
  // (新增) extraReducers 来处理异步的 registerUser 和 loginUserAsync
  extraReducers: (builder) => {
    builder
      // 注册处理
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        const { user, token } = action.payload;

        // 将后端返回的 User 转换为您 App 状态中的 UserAccount
        const newAccount: UserAccount = {
          id: user.id.toString(), // 将 MySQL 的 number ID 转换为 string
          name: user.name,
          email: user.email,
          role: 'normal', // 默认值
          petsCount: 0, // 默认值
          hasCompletedProfile: false // 默认值
        };
        
        state.accounts.push(newAccount);
        state.activeUserId = newAccount.id;
        state.token = token; // 存储 Token
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 存储错误信息 (例如: "该邮箱已注册")
      })
      // 登录处理
      .addCase(loginUserAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        const { user, token } = action.payload;
        
        // 检查是否已存在该账号
        const existingAccountIndex = state.accounts.findIndex(
          acc => acc.id === user.id.toString()
        );
        
        if (existingAccountIndex === -1) {
          // 如果不存在，添加到accounts
          const newAccount: UserAccount = {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: 'normal',
            petsCount: 0,
            hasCompletedProfile: false
          };
          state.accounts.push(newAccount);
        }
        
        state.activeUserId = user.id.toString();
        state.token = token;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // 存储错误信息 (例如: "邮箱或密码错误")
      });
  }
});

// --- 7. (修改) 您的 Action 导出 ---
export const {
  // 'registerUser' 已被移除，因为它现在是异步 Thunk
  loginUser,
  logout,
  promoteUser,
  updateAccountDetails
} = authSlice.actions;

export default authSlice.reducer;

