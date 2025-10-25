import axios, {type AxiosAdapter, type AxiosRequestConfig} from 'axios';
import {
  type CommunityAnswer,
  type CommunityPost,
  type CommunityQuestion,
  type CommunityTag,
  type CreateAnswerPayload,
  type CreatePostPayload,
  type CreateQuestionPayload,
  type NearbyPetOwner,
  type PaginatedResponse
} from '@app/types';

const NETWORK_DELAY = 400;
const PAGE_SIZE = 10;

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const createId = (): string =>
  `cm-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const paginateList = <T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    page,
    hasMore: end < items.length
  };
};

let mockPosts: CommunityPost[] = [
  {
    id: 'post-luna-sunbath',
    authorId: 'user-luna',
    authorName: 'Luna & Coco',
    authorAvatar:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=60',
    content:
      'Coco mastered his morning sunbath routine ☀️ Any tips for keeping him cool in the afternoon?',
    createdAt: new Date().toISOString(),
    media: [
      {
        id: 'media-coco-1',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=60'
      }
    ],
    tags: ['daily'],
    likes: 142,
    comments: 18
  },
  {
    id: 'post-rescue-aurora',
    authorId: 'user-aurora',
    authorName: 'Aurora Rescue Team',
    authorAvatar:
      'https://images.unsplash.com/photo-1500839941678-aae14dbfae66?auto=format&fit=crop&w=200&q=60',
    content:
      '🚨 Emergency foster needed for a gentle malamute girl found near Riverside Park. DM if you can host for 2 weeks.',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    tags: ['rescue'],
    media: [
      {
        id: 'media-rescue-1',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=60'
      }
    ],
    likes: 231,
    comments: 42
  },
  {
    id: 'post-training-leo',
    authorId: 'user-leo',
    authorName: 'Leo',
    authorAvatar:
      'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=200&q=60',
    content:
      'Recorded our scent tracking practice today. Proud of this fluffy detective!',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    media: [
      {
        id: 'media-leo-vid',
        type: 'video',
        uri: 'https://videos.pexels.com/video-files/856915/856915-hd_1920_1080_25fps.mp4',
        thumbnail:
          'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=60'
      }
    ],
    tags: ['daily', 'qa'],
    likes: 89,
    comments: 9
  }
];

let mockQuestions: CommunityQuestion[] = [
  {
    id: 'question-diet',
    question: 'What protein percentage works best for an active husky in summer?',
    authorId: 'user-luna',
    authorName: 'Luna & Coco',
    authorAvatar:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=60',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    tags: ['qa'],
    answers: [
      {
        id: 'answer-nutritionist',
        authorId: 'user-nola',
        authorName: 'Dr. Nola',
        authorAvatar:
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=60',
        createdAt: new Date(Date.now() - 84_000_000).toISOString(),
        text: 'I keep active huskies at 24-26% protein with omega-3 toppers to avoid overheating.',
        isAccepted: true
      }
    ]
  },
  {
    id: 'question-rescue',
    question: 'Any volunteer vets available next weekend for vaccination drive?',
    authorId: 'user-aurora',
    authorName: 'Aurora Rescue Team',
    authorAvatar:
      'https://images.unsplash.com/photo-1500839941678-aae14dbfae66?auto=format&fit=crop&w=200&q=60',
    createdAt: new Date(Date.now() - 43_200_000).toISOString(),
    tags: ['rescue', 'qa'],
    answers: []
  }
];

let mockNearbyOwners: NearbyPetOwner[] = [
  {
    id: 'nearby-cici',
    displayName: 'CiCi & Maple',
    avatar:
      'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&w=200&q=60',
    distanceKm: 0.8,
    petSummary: 'Golden retriever · loves dock diving',
    lastActive: new Date(Date.now() - 5 * 60_000).toISOString()
  },
  {
    id: 'nearby-taro',
    displayName: 'Taro & Mochi',
    avatar:
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=200&q=60',
    distanceKm: 1.5,
    petSummary: 'Shiba siblings · agility & sniff party hosts',
    lastActive: new Date(Date.now() - 45 * 60_000).toISOString()
  },
  {
    id: 'nearby-nova',
    displayName: 'Nova',
    avatar:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=60',
    distanceKm: 2.1,
    petSummary: 'Cat behavior mentor · clicker training nerd',
    lastActive: new Date(Date.now() - 12 * 60_000).toISOString()
  }
];

const respond = async <T>(config: AxiosRequestConfig, data: T) => {
  await sleep(NETWORK_DELAY);
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: 'OK'
  };
};

const mockAdapter: AxiosAdapter = async config => {
  const {method = 'get'} = config;
  const url = (config.url ?? '').replace(/\/+$/, '');
  const params = (config.params ?? {}) as {
    page?: number;
    pageSize?: number;
    tag?: CommunityTag;
  };
  const body =
    typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {};

  if (method === 'get' && url === '/api/posts') {
    const page = Number(params.page ?? 1);
    const pageSize = Number(params.pageSize ?? PAGE_SIZE);
    const tag = (params.tag ?? 'all') as CommunityTag;
    const filtered =
      tag === 'all'
        ? mockPosts
        : mockPosts.filter(post => post.tags.includes(tag));
    return respond(config, paginateList(filtered, page, pageSize));
  }

  if (method === 'post' && url === '/api/posts') {
    const payload = body as CreatePostPayload;
    const newPost: CommunityPost = {
      id: createId(),
      authorId: payload.authorId ?? 'demo-user',
      authorName: 'You',
      authorAvatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
      createdAt: new Date().toISOString(),
      content: payload.content,
      tags: payload.tags.length > 0 ? payload.tags : ['daily'],
      media: payload.media,
      likes: 0,
      comments: 0,
      likedByMe: false
    };
    mockPosts = [newPost, ...mockPosts];
    return respond(config, newPost);
  }

  const likeMatch = url.match(/\/api\/posts\/(.+)\/like$/);
  if (method === 'post' && likeMatch) {
    const postId = likeMatch[1];
    const liked = Boolean(body?.liked ?? true);
    mockPosts = mockPosts.map(post =>
      post.id === postId
        ? {
            ...post,
            likes: Math.max(0, post.likes + (liked ? 1 : -1)),
            likedByMe: liked
          }
        : post
    );
    return respond(
      config,
      mockPosts.find(post => post.id === postId)
    );
  }

  const commentMatch = url.match(/\/api\/posts\/(.+)\/comment$/);
  if (method === 'post' && commentMatch) {
    const postId = commentMatch[1];
    mockPosts = mockPosts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: post.comments + 1
          }
        : post
    );
    return respond(
      config,
      mockPosts.find(post => post.id === postId)
    );
  }

  if (method === 'get' && url === '/api/questions') {
    return respond(config, mockQuestions);
  }

  if (method === 'post' && url === '/api/questions') {
    const payload = body as CreateQuestionPayload;
    const newQuestion: CommunityQuestion = {
      id: createId(),
      question: payload.question,
      tags: payload.tags.length > 0 ? payload.tags : ['qa'],
      authorId: payload.authorId ?? 'demo-user',
      authorName: 'You',
      authorAvatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
      createdAt: new Date().toISOString(),
      answers: []
    };
    mockQuestions = [newQuestion, ...mockQuestions];
    return respond(config, newQuestion);
  }

  const answerMatch = url.match(/\/api\/questions\/(.+)\/answers$/);
  if (method === 'post' && answerMatch) {
    const questionId = answerMatch[1];
    const payload = body as CreateAnswerPayload;
    const newAnswer: CommunityAnswer = {
      id: createId(),
      authorId: payload.authorId ?? 'demo-user',
      authorName: 'You',
      authorAvatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
      text: payload.text,
      createdAt: new Date().toISOString(),
      isAccepted: false
    };
    mockQuestions = mockQuestions.map(question =>
      question.id === questionId
        ? {...question, answers: [...question.answers, newAnswer]}
        : question
    );
    return respond(
      config,
      mockQuestions.find(question => question.id === questionId)
    );
  }

  const acceptMatch = url.match(/\/api\/questions\/(.+)\/accept$/);
  if (method === 'post' && acceptMatch) {
    const questionId = acceptMatch[1];
    const answerId = body?.answerId as string;
    mockQuestions = mockQuestions.map(question =>
      question.id === questionId
        ? {
            ...question,
            answers: question.answers.map(answer => ({
              ...answer,
              isAccepted: answer.id === answerId
            }))
          }
        : question
    );
    return respond(
      config,
      mockQuestions.find(question => question.id === questionId)
    );
  }

  if (method === 'get' && url === '/api/users/nearby') {
    return respond(config, mockNearbyOwners);
  }

  const requestMatch = url.match(/\/api\/users\/(.+)\/request$/);
  if (method === 'post' && requestMatch) {
    const userId = requestMatch[1];
    mockNearbyOwners = mockNearbyOwners.map(owner =>
      owner.id === userId
        ? {
            ...owner,
            isRequestPending: true
          }
        : owner
    );
    return respond(
      config,
      mockNearbyOwners.find(owner => owner.id === userId)
    );
  }

  return respond(config, {ok: true});
};

const mockHttp = axios.create({
  adapter: mockAdapter
});

export const communityApi = {
  fetchPosts: async (params: {
    page?: number;
    pageSize?: number;
    tag?: CommunityTag;
  }): Promise<PaginatedResponse<CommunityPost>> => {
    const response = await mockHttp.get<PaginatedResponse<CommunityPost>>(
      '/api/posts',
      {
        params
      }
    );
    return response.data;
  },
  createPost: async (
    payload: CreatePostPayload
  ): Promise<CommunityPost> => {
    const response = await mockHttp.post<CommunityPost>('/api/posts', payload);
    return response.data;
  },
  likePost: async (postId: string, liked: boolean): Promise<CommunityPost> => {
    const response = await mockHttp.post<CommunityPost>(
      `/api/posts/${postId}/like`,
      {liked}
    );
    return response.data;
  },
  commentOnPost: async (
    postId: string,
    text: string
  ): Promise<CommunityPost> => {
    const response = await mockHttp.post<CommunityPost>(
      `/api/posts/${postId}/comment`,
      {text}
    );
    return response.data;
  },
  fetchQuestions: async (): Promise<CommunityQuestion[]> => {
    const response = await mockHttp.get<CommunityQuestion[]>('/api/questions');
    return response.data;
  },
  createQuestion: async (
    payload: CreateQuestionPayload
  ): Promise<CommunityQuestion> => {
    const response = await mockHttp.post<CommunityQuestion>(
      '/api/questions',
      payload
    );
    return response.data;
  },
  createAnswer: async (
    payload: CreateAnswerPayload
  ): Promise<CommunityQuestion> => {
    const response = await mockHttp.post<CommunityQuestion>(
      `/api/questions/${payload.questionId}/answers`,
      payload
    );
    return response.data;
  },
  markAnswerAccepted: async (
    questionId: string,
    answerId: string
  ): Promise<CommunityQuestion> => {
    const response = await mockHttp.post<CommunityQuestion>(
      `/api/questions/${questionId}/accept`,
      {answerId}
    );
    return response.data;
  },
  fetchNearbyUsers: async (): Promise<NearbyPetOwner[]> => {
    const response = await mockHttp.get<NearbyPetOwner[]>('/api/users/nearby');
    return response.data;
  },
  sendFriendRequest: async (userId: string): Promise<NearbyPetOwner> => {
    const response = await mockHttp.post<NearbyPetOwner>(
      `/api/users/${userId}/request`
    );
    return response.data;
  }
};
