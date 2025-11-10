import axios from 'axios';
import {
  FeedingReminder,
  HealthTrendReport,
  HabitAnalytics,
  HabitEntry,
  PetHealthProfile,
  mockFeedingReminders,
  mockHealthTrendReport,
  mockPetHealthProfile,
  mockHabitAnalytics
} from '@app/types';

// API基础URL - Android模拟器使用10.0.2.2，iOS/Web使用localhost
const API_BASE_URL = process.env.PET_HEALTH_BASE_URL ?? 'http://10.0.2.2:3000/api';

const petHealthClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

/**
 * 创建带认证的API客户端
 */
const createAuthenticatedClient = (token: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const fetchPetHealthProfile = async (
  petId: string,
  token?: string
): Promise<PetHealthProfile> => {
  if (!token) {
    throw new Error('需要token才能获取健康档案');
  }
  
  const client = createAuthenticatedClient(token);
  const response = await client.get<PetHealthProfile>(`/pets/${petId}/health`);
    return response.data;
};

export const updatePetHealthProfile = async (
  petId: string,
  payload: Partial<PetHealthProfile>
): Promise<PetHealthProfile> => {
  const response = await petHealthClient.put<PetHealthProfile>(`/pets/${petId}/health`, payload);
  return response.data;
};

export const fetchHealthTrendReport = async (petId: string, token?: string): Promise<HealthTrendReport> => {
  if (!token) {
    throw new Error('需要token才能获取健康趋势');
  }
  const client = createAuthenticatedClient(token);
  const response = await client.get<HealthTrendReport>(`/pets/${petId}/health/trends`);
  return response.data;
};

export const fetchFeedingReminders = async (petId: string): Promise<FeedingReminder[]> => {
  try {
    const response = await petHealthClient.get<FeedingReminder[]>(
      `/pets/${petId}/feeding-reminders`
    );
    return response.data;
  } catch (error) {
    console.warn('[petHealthClient] fallback to mock reminders', error);
    return mockFeedingReminders;
  }
};

export const createFeedingReminder = async (
  petId: string,
  reminder: Pick<FeedingReminder, 'label' | 'time' | 'enabled'>
): Promise<FeedingReminder> => {
  const response = await petHealthClient.post<FeedingReminder>(
    `/pets/${petId}/feeding-reminders`,
    reminder
  );
  return response.data;
};

export const updateFeedingReminder = async (
  petId: string,
  reminderId: string,
  payload: Partial<FeedingReminder>
): Promise<FeedingReminder> => {
  const response = await petHealthClient.patch<FeedingReminder>(
    `/pets/${petId}/feeding-reminders/${reminderId}`,
    payload
  );
  return response.data;
};

export const fetchHabitAnalytics = async (petId: string): Promise<HabitAnalytics> => {
  try {
    const response = await petHealthClient.get<HabitAnalytics>(`/pets/${petId}/habit-analytics`);
    return response.data;
  } catch (error) {
    console.warn('[petHealthClient] fallback to mock habit analytics', error);
    return mockHabitAnalytics;
  }
};

export type HabitEntryPayload = {
  date: string;
  completedTasks: string[];
  feedingGrams?: number | null;
  exerciseMinutes?: number | null;
  weightKg?: number | null;
  notes?: string;
};

export const recordHabitEntry = async (
  petId: string,
  token: string,
  payload: HabitEntryPayload
): Promise<HabitEntry> => {
  const client = createAuthenticatedClient(token);
  const response = await client.post<HabitEntry>(`/pets/${petId}/habits`, payload);
  return response.data;
};

export const fetchHabitEntries = async (
  petId: string,
  token: string,
  limit = 5
): Promise<HabitEntry[]> => {
  const client = createAuthenticatedClient(token);
  const response = await client.get<HabitEntry[]>(`/pets/${petId}/habits`, {
    params: {limit}
  });
  return response.data;
};
