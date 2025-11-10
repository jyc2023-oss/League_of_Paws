import axios from 'axios';
import {PetProfile} from '@app/store/zustand/petStore';

// API基础URL - Android模拟器使用10.0.2.2，iOS/Web使用localhost
const API_BASE_URL = 'http://10.0.2.2:3000/api';

/**
 * 创建宠物API客户端（带认证）
 */
const createPetApiClient = (token: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 创建宠物
 * @param token - JWT token
 * @param petData - 宠物数据
 */
export const createPet = async (
  token: string,
  petData: {
    name: string;
    species: 'dog' | 'cat' | 'other';
    ageInMonths?: number;
    breed?: string;
    weightKg?: number;
    avatarUrl?: string;
  }
): Promise<PetProfile> => {
  const client = createPetApiClient(token);
  const response = await client.post<{
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'other';
    ageInMonths?: number;
    avatarUrl?: string;
  }>('/pets', petData);
  
  return {
    id: response.data.id,
    name: response.data.name,
    species: response.data.species,
    ageInMonths: response.data.ageInMonths,
    avatarUrl: response.data.avatarUrl
  };
};

/**
 * 获取用户的所有宠物列表
 * @param token - JWT token
 */
export const fetchPets = async (token: string): Promise<PetProfile[]> => {
  const client = createPetApiClient(token);
  const response = await client.get<Array<{
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'other';
    ageInMonths?: number;
    avatarUrl?: string;
  }>>('/pets');
  
  return response.data.map(pet => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    ageInMonths: pet.ageInMonths,
    avatarUrl: pet.avatarUrl
  }));
};

/**
 * 更新宠物基本信息
 */
export const updatePet = async (
  token: string,
  petId: string,
  petData: {
    name?: string;
    breed?: string;
    ageInMonths?: number;
    weightKg?: number;
  }
): Promise<void> => {
  const client = createPetApiClient(token);
  await client.put(`/pets/${petId}`, petData);
};

/**
 * 添加疫苗记录
 */
export const addVaccine = async (
  token: string,
  petId: string,
  vaccineData: {
    name: string;
    date: string;
    clinic?: string;
    vet?: string;
    effect?: string;
    precautions?: string;
    notes?: string;
  }
): Promise<any> => {
  const client = createPetApiClient(token);
  const response = await client.post(`/pets/${petId}/vaccines`, vaccineData);
  return response.data;
};

/**
 * 添加体检报告
 */
export const addCheckup = async (
  token: string,
  petId: string,
  checkupData: {
    date: string;
    clinic?: string;
    vet?: string;
    summary?: string;
    details?: string;
    reportFileUrl?: string;
    weightKg?: number;
  }
): Promise<any> => {
  const client = createPetApiClient(token);
  const response = await client.post(`/pets/${petId}/checkups`, checkupData);
  return response.data;
};

/**
 * 添加过敏史
 */
export const addAllergy = async (
  token: string,
  petId: string,
  allergyData: {
    allergen: string;
    reaction?: string;
    severity?: 'low' | 'medium' | 'high';
    notes?: string;
  }
): Promise<any> => {
  const client = createPetApiClient(token);
  const response = await client.post(`/pets/${petId}/allergies`, allergyData);
  return response.data;
};

/**
 * 更新喂食计划
 */
export const updateFeedingPlan = async (
  token: string,
  petId: string,
  planData: {
    food?: string;
    caloriesPerMeal?: number;
    schedule?: string[];
    notes?: string;
  }
): Promise<any> => {
  const client = createPetApiClient(token);
  const response = await client.put(`/pets/${petId}/feeding-plan`, planData);
  return response.data;
};

/**
 * 添加运动记录
 */
export const addExercise = async (
  token: string,
  petId: string,
  exerciseData: {
    date: string;
    activity: string;
    durationMinutes: number;
    intensity?: 'low' | 'medium' | 'high';
  }
): Promise<any> => {
  const client = createPetApiClient(token);
  const response = await client.post(`/pets/${petId}/exercises`, exerciseData);
  return response.data;
};
