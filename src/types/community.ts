export type CommunityTag = 'all' | 'daily' | 'qa' | 'rescue';

export type CommunityMediaType = 'image' | 'video';

export type CommunityMedia = {
  id: string;
  type: CommunityMediaType;
  uri: string;
  /**
   * Optional poster/thumbnail for videos so we can keep the UI lightweight.
   */
  thumbnail?: string;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  content: string;
  media?: CommunityMedia[];
  tags: CommunityTag[];
  likes: number;
  comments: number;
  likedByMe?: boolean;
};

export type CreatePostPayload = {
  content: string;
  tags: CommunityTag[];
  media?: CommunityMedia[];
  authorId?: string;
};

export type CommunityAnswer = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  isAccepted?: boolean;
};

export type CommunityQuestion = {
  id: string;
  question: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  tags: CommunityTag[];
  answers: CommunityAnswer[];
};

export type CreateQuestionPayload = Pick<
  CommunityQuestion,
  'question' | 'tags'
> & {
  authorId?: string;
};

export type CreateAnswerPayload = {
  questionId: string;
  text: string;
  authorId?: string;
};

export type NearbyPetOwner = {
  id: string;
  displayName: string;
  avatar: string;
  distanceKm: number;
  petSummary: string;
  lastActive: string;
  isFriend?: boolean;
  isRequestPending?: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  hasMore: boolean;
};

export const COMMUNITY_TAGS: Array<{label: string; value: CommunityTag}> = [
  {label: 'All', value: 'all'},
  {label: 'Daily', value: 'daily'},
  {label: 'Q&A', value: 'qa'},
  {label: 'Rescue', value: 'rescue'}
];
