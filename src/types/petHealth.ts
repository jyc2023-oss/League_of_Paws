export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  clinic: string;
  vet: string;
  notes?: string;
}

export interface MedicalCheckup {
  id: string;
  date: string;
  clinic: string;
  vet: string;
  summary: string;
  weightKg: number;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface FeedingPlan {
  food: string;
  caloriesPerMeal: number;
  schedule: string[];
  notes?: string;
}

export interface ExerciseRecord {
  id: string;
  date: string;
  activity: string;
  durationMinutes: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface PetHealthProfile {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weightKg: number;
  vaccines: VaccineRecord[];
  checkups: MedicalCheckup[];
  allergies: AllergyRecord[];
  feedingPlan: FeedingPlan;
  exerciseRecords: ExerciseRecord[];
}

export interface HealthTrendPoint {
  date: string;
  feedingGrams: number;
  exerciseMinutes: number;
  weightKg: number;
}

export interface HealthTrendReport {
  petId: string;
  points: HealthTrendPoint[];
}

export interface FeedingReminder {
  id: string;
  petId: string;
  label: string;
  time: string;
  enabled: boolean;
}

export interface HabitAnalytics {
  petId: string;
  companionshipScore: number;
  consistencyScore: number;
  streakDays: number;
  insights: string[];
}

export const mockPetHealthProfile: PetHealthProfile = {
  id: 'pet-001',
  name: '奶茶',
  species: '犬',
  breed: '柯基',
  age: 3,
  weightKg: 11.2,
  vaccines: [
    {
      id: 'vac-1',
      name: '狂犬疫苗',
      date: '2024-09-12',
      clinic: '城市宠物医院',
      vet: '陈医生',
      notes: '加强针，反应轻微'
    },
    {
      id: 'vac-2',
      name: '六联疫苗',
      date: '2024-03-20',
      clinic: '城市宠物医院',
      vet: '陈医生'
    }
  ],
  checkups: [
    {
      id: 'chk-1',
      date: '2024-09-12',
      clinic: '城市宠物医院',
      vet: '陈医生',
      summary: '身体状况良好，建议控制体重',
      weightKg: 11.2
    },
    {
      id: 'chk-2',
      date: '2024-03-20',
      clinic: '城市宠物医院',
      vet: '陈医生',
      summary: '牙齿清洁，肠胃正常',
      weightKg: 10.8
    }
  ],
  allergies: [
    {
      id: 'alg-1',
      allergen: '鸡肉',
      reaction: '皮肤瘙痒',
      severity: 'medium',
      notes: '换粮后症状改善'
    }
  ],
  feedingPlan: {
    food: '低敏三文鱼配方',
    caloriesPerMeal: 320,
    schedule: ['07:30', '12:30', '18:30'],
    notes: '喂食时加入益生菌'
  },
  exerciseRecords: [
    {
      id: 'ex-1',
      date: '2024-10-20',
      activity: '慢跑',
      durationMinutes: 30,
      intensity: 'medium'
    },
    {
      id: 'ex-2',
      date: '2024-10-19',
      activity: '飞盘',
      durationMinutes: 25,
      intensity: 'high'
    },
    {
      id: 'ex-3',
      date: '2024-10-18',
      activity: '散步',
      durationMinutes: 40,
      intensity: 'low'
    }
  ]
};

export const mockHealthTrendReport: HealthTrendReport = {
  petId: 'pet-001',
  points: [
    {date: '2024-10-14', feedingGrams: 320, exerciseMinutes: 40, weightKg: 11.3},
    {date: '2024-10-15', feedingGrams: 300, exerciseMinutes: 25, weightKg: 11.25},
    {date: '2024-10-16', feedingGrams: 320, exerciseMinutes: 35, weightKg: 11.2},
    {date: '2024-10-17', feedingGrams: 310, exerciseMinutes: 28, weightKg: 11.22},
    {date: '2024-10-18', feedingGrams: 320, exerciseMinutes: 40, weightKg: 11.18},
    {date: '2024-10-19', feedingGrams: 330, exerciseMinutes: 30, weightKg: 11.15},
    {date: '2024-10-20', feedingGrams: 320, exerciseMinutes: 32, weightKg: 11.1}
  ]
};

export const mockFeedingReminders: FeedingReminder[] = [
  {id: 'rem-1', petId: 'pet-001', label: '早餐', time: '07:30', enabled: true},
  {id: 'rem-2', petId: 'pet-001', label: '午餐', time: '12:30', enabled: false},
  {id: 'rem-3', petId: 'pet-001', label: '晚餐', time: '18:30', enabled: true}
];

export const mockHabitAnalytics: HabitAnalytics = {
  petId: 'pet-001',
  companionshipScore: 78,
  consistencyScore: 84,
  streakDays: 12,
  insights: [
    '最近三天夜间散步次数下降，建议保持固定节奏',
    '周末陪伴时长明显提升，可继续保持',
    '喂食提醒开启率 90%，有助于保持体重管理'
  ]
};
