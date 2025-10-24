import {createSlice, nanoid, PayloadAction} from '@reduxjs/toolkit';

export type UserRole = 'normal' | 'senior';

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  petsCount: number;
  hasCompletedProfile: boolean;
};

type RegisterPayload = {
  name: string;
  email: string;
};

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

export type AuthState = {
  accounts: UserAccount[];
  activeUserId?: string;
};

const initialState: AuthState = {
  accounts: [],
  activeUserId: undefined
};

const ensureAccountMutable = (
  accounts: UserAccount[],
  userId: string
): UserAccount | undefined => accounts.find(account => account.id === userId);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerUser(state, action: PayloadAction<RegisterPayload>) {
      const {email, name} = action.payload;
      const existingAccount = state.accounts.find(
        account =>
          account.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (existingAccount) {
        state.activeUserId = existingAccount.id;
        return;
      }

      const newAccount: UserAccount = {
        id: nanoid(),
        name,
        email,
        role: 'normal',
        petsCount: 0,
        hasCompletedProfile: false
      };

      state.accounts.push(newAccount);
      state.activeUserId = newAccount.id;
    },
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
    logout(state) {
      state.activeUserId = undefined;
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
  }
});

export const {
  registerUser,
  loginUser,
  logout,
  promoteUser,
  updateAccountDetails
} = authSlice.actions;

export default authSlice.reducer;
