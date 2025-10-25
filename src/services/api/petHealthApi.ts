import axios from 'axios';
import {
  FeedingReminder,
  HealthTrendReport,
  HabitAnalytics,
  PetHealthProfile,
  mockFeedingReminders,
  mockHealthTrendReport,
  mockPetHealthProfile,
  mockHabitAnalytics
} from '@app/types';

const petHealthClient = axios.create({
  baseURL: process.env.PET_HEALTH_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 10000
});

export const fetchPetHealthProfile = async (petId: string): Promise<PetHealthProfile> => {
  try {
    const response = await petHealthClient.get<PetHealthProfile>(`/pets/${petId}/health`);
    return response.data;
  } catch (error) {
    console.warn('[petHealthClient] fallback to mock profile', error);
    return mockPetHealthProfile;
  }
};

export const updatePetHealthProfile = async (
  petId: string,
  payload: Partial<PetHealthProfile>
): Promise<PetHealthProfile> => {
  const response = await petHealthClient.put<PetHealthProfile>(`/pets/${petId}/health`, payload);
  return response.data;
};

export const fetchHealthTrendReport = async (petId: string): Promise<HealthTrendReport> => {
  try {
    const response = await petHealthClient.get<HealthTrendReport>(`/pets/${petId}/health/trends`);
    return response.data;
  } catch (error) {
    console.warn('[petHealthClient] fallback to mock trends', error);
    return mockHealthTrendReport;
  }
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
