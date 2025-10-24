import {createSlice, nanoid, PayloadAction} from '@reduxjs/toolkit';

export type HabitCheckIn = {
  id: string;
  userId: string;
  date: string;
  note?: string;
  completedTasks: string[];
};

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'normal' | 'senior';
  createdAt: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
  likes: number;
};

export type ServiceRecord = {
  id: string;
  userId: string;
  serviceName: string;
  category: 'hospital' | 'grooming' | 'park' | 'training';
  status: 'planned' | 'completed';
  visitedAt?: string;
};

export type RescueCase = {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
};

type CreateHabitPayload = {
  userId: string;
  note?: string;
  completedTasks: string[];
};

type CreatePostPayload = {
  authorId: string;
  authorName: string;
  authorRole: 'normal' | 'senior';
  content: string;
  tags?: string[];
};

type PromotePostPayload = {
  postId: string;
  isPinned?: boolean;
  isFeatured?: boolean;
};

type LikePostPayload = {
  postId: string;
};

type RecordServicePayload = {
  userId: string;
  serviceName: string;
  category: ServiceRecord['category'];
};

type CompleteServicePayload = {
  recordId: string;
};

type RescueSubmissionPayload = {
  userId: string;
  title: string;
  description: string;
  location: string;
};

type UpdateRescuePayload = {
  caseId: string;
  status: RescueCase['status'];
};

export type CommunityState = {
  habits: HabitCheckIn[];
  posts: CommunityPost[];
  services: ServiceRecord[];
  rescueCases: RescueCase[];
};

const initialState: CommunityState = {
  habits: [],
  posts: [],
  services: [],
  rescueCases: []
};

const contentSlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    recordHabitCheckIn: {
      reducer(state, action: PayloadAction<HabitCheckIn>) {
        state.habits.push(action.payload);
      },
      prepare(payload: CreateHabitPayload) {
        return {
          payload: {
            id: nanoid(),
            userId: payload.userId,
            note: payload.note,
            date: new Date().toISOString(),
            completedTasks: payload.completedTasks
          } satisfies HabitCheckIn
        };
      }
    },
    createCommunityPost: {
      reducer(state, action: PayloadAction<CommunityPost>) {
        state.posts.unshift(action.payload);
      },
      prepare({
        authorId,
        authorName,
        authorRole,
        content,
        tags
      }: CreatePostPayload) {
        return {
          payload: {
            id: nanoid(),
            authorId,
            authorName,
            authorRole,
            content,
            likes: 0,
            isFeatured: false,
            isPinned: false,
            createdAt: new Date().toISOString(),
            tags: tags ?? []
          } satisfies CommunityPost
        };
      }
    },
    updatePostHighlights(state, action: PayloadAction<PromotePostPayload>) {
      const {postId, isFeatured, isPinned} = action.payload;
      const post = state.posts.find(item => item.id === postId);
      if (post) {
        if (typeof isPinned === 'boolean') {
          post.isPinned = isPinned;
        }
        if (typeof isFeatured === 'boolean') {
          post.isFeatured = isFeatured;
        }
      }
    },
    likePost(state, action: PayloadAction<LikePostPayload>) {
      const post = state.posts.find(item => item.id === action.payload.postId);
      if (post) {
        post.likes += 1;
      }
    },
    recordServiceVisit: {
      reducer(state, action: PayloadAction<ServiceRecord>) {
        state.services.push(action.payload);
      },
      prepare({category, serviceName, userId}: RecordServicePayload) {
        return {
          payload: {
            id: nanoid(),
            userId,
            serviceName,
            category,
            status: 'planned'
          } satisfies ServiceRecord
        };
      }
    },
    completeServiceVisit(state, action: PayloadAction<CompleteServicePayload>) {
      const record = state.services.find(
        item => item.id === action.payload.recordId
      );
      if (record) {
        record.status = 'completed';
        record.visitedAt = new Date().toISOString();
      }
    },
    submitRescueCase: {
      reducer(state, action: PayloadAction<RescueCase>) {
        state.rescueCases.unshift(action.payload);
      },
      prepare({description, location, title, userId}: RescueSubmissionPayload) {
        return {
          payload: {
            id: nanoid(),
            userId,
            title,
            description,
            location,
            status: 'open',
            createdAt: new Date().toISOString()
          } satisfies RescueCase
        };
      }
    },
    updateRescueStatus(state, action: PayloadAction<UpdateRescuePayload>) {
      const rescueCase = state.rescueCases.find(
        item => item.id === action.payload.caseId
      );
      if (rescueCase) {
        rescueCase.status = action.payload.status;
      }
    }
  }
});

export const {
  recordHabitCheckIn,
  createCommunityPost,
  updatePostHighlights,
  likePost,
  recordServiceVisit,
  completeServiceVisit,
  submitRescueCase,
  updateRescueStatus
} = contentSlice.actions;

export default contentSlice.reducer;
