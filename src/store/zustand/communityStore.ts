import {create} from 'zustand';
import {
  type CommunityAnswer,
  type CommunityPost,
  type CommunityQuestion,
  type CommunityTag,
  type NearbyPetOwner
} from '@app/types';

type LikeDictionary = Record<string, boolean>;

type CommunityStoreState = {
  posts: CommunityPost[];
  questions: CommunityQuestion[];
  nearbyUsers: NearbyPetOwner[];
  filterTag: CommunityTag;
  likedPostMap: LikeDictionary;
  hasMorePosts: boolean;
  nextPage: number;
  setFilterTag: (tag: CommunityTag) => void;
  setPosts: (posts: CommunityPost[], options?: {hasMore?: boolean}) => void;
  appendPosts: (posts: CommunityPost[], options?: {hasMore?: boolean}) => void;
  addPostToTop: (post: CommunityPost) => void;
  toggleLike: (postId: string, liked: boolean) => void;
  incrementCommentCount: (postId: string, amount?: number) => void;
  setQuestions: (questions: CommunityQuestion[]) => void;
  addQuestion: (question: CommunityQuestion) => void;
  replaceQuestion: (question: CommunityQuestion) => void;
  addAnswer: (questionId: string, answer: CommunityAnswer) => void;
  markAnswerAccepted: (questionId: string, answerId: string) => void;
  setNearbyUsers: (users: NearbyPetOwner[]) => void;
  markFriendRequested: (userId: string) => void;
  resetPagination: () => void;
};

const dedupeById = <T extends {id: string}>(list: T[]): T[] => {
  const map = new Map<string, T>();
  list.forEach(item => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
};

export const useCommunityStore = create<CommunityStoreState>((set, get) => ({
  posts: [],
  questions: [],
  nearbyUsers: [],
  filterTag: 'all',
  likedPostMap: {},
  hasMorePosts: true,
  nextPage: 2,
  setFilterTag: tag => set({filterTag: tag}),
  setPosts: (posts, options) =>
    set({
      posts,
      hasMorePosts: options?.hasMore ?? true,
      nextPage: 2
    }),
  appendPosts: (posts, options) =>
    set(state => {
      const merged = dedupeById([...state.posts, ...posts]);
      return {
        posts: merged,
        hasMorePosts: options?.hasMore ?? state.hasMorePosts,
        nextPage: options?.hasMore === false ? state.nextPage : state.nextPage + 1
      };
    }),
  addPostToTop: post =>
    set(state => ({
      posts: dedupeById([post, ...state.posts])
    })),
  toggleLike: (postId, liked) =>
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: Math.max(0, post.likes + (liked ? 1 : -1)),
              likedByMe: liked
            }
          : post
      ),
      likedPostMap: {
        ...state.likedPostMap,
        [postId]: liked
      }
    })),
  incrementCommentCount: (postId, amount = 1) =>
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: Math.max(0, post.comments + amount)
            }
          : post
      )
    })),
  setQuestions: questions => set({questions}),
  addQuestion: question =>
    set(state => ({
      questions: [question, ...state.questions]
    })),
  replaceQuestion: question =>
    set(state => ({
      questions: state.questions.map(item =>
        item.id === question.id ? question : item
      )
    })),
  addAnswer: (questionId, answer) =>
    set(state => ({
      questions: state.questions.map(question =>
        question.id === questionId
          ? {...question, answers: [...question.answers, answer]}
          : question
      )
    })),
  markAnswerAccepted: (questionId, answerId) =>
    set(state => ({
      questions: state.questions.map(question =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map(answer => ({
                ...answer,
                isAccepted: answer.id === answerId
              }))
            }
          : question
      )
    })),
  setNearbyUsers: users => set({nearbyUsers: users}),
  markFriendRequested: userId =>
    set(state => ({
      nearbyUsers: state.nearbyUsers.map(user =>
        user.id === userId
          ? {...user, isRequestPending: true}
          : user
      )
    })),
  resetPagination: () => set({nextPage: 2, hasMorePosts: true})
}));
