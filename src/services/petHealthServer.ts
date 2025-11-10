import express, {Request, Response} from 'express';
import cors from 'cors';
import {
  HealthTrendReport,
  PetHealthProfile,
  FeedingReminder,
  HabitAnalytics,
  HabitEntry,
  mockPetHealthProfile,
  mockHealthTrendReport,
  mockFeedingReminders,
  mockHabitAnalytics
} from '@app/types';

type PetHealthMap = Record<string, PetHealthProfile>;
type TrendMap = Record<string, HealthTrendReport>;
type HabitHistoryMap = Record<string, HabitEntry[]>;

const petProfiles: PetHealthMap = {
  [mockPetHealthProfile.id]: {...mockPetHealthProfile}
};

const trendReports: TrendMap = {
  [mockHealthTrendReport.petId]: {...mockHealthTrendReport}
};

let feedingReminders: FeedingReminder[] = [...mockFeedingReminders];
const habitAnalytics: Record<string, HabitAnalytics> = {
  [mockHabitAnalytics.petId]: {...mockHabitAnalytics}
};
const habitHistory: HabitHistoryMap = {
  [mockHealthTrendReport.petId]: mockHealthTrendReport.points.map((point, index) => ({
    id: `habit-${index}`,
    date: point.date,
    feedingGrams: point.feedingGrams,
    exerciseMinutes: point.exerciseMinutes,
    weightKg: point.weightKg,
    completedTasks: ['feeding', 'walking'],
    notes: ''
  }))
};

const recalcTrend = (petId: string) => {
  const history = habitHistory[petId];
  if (!history) {
    return;
  }
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  trendReports[petId] = {
    petId,
    points: recent.map(entry => ({
      date: entry.date,
      feedingGrams: entry.feedingGrams ?? 0,
      exerciseMinutes: entry.exerciseMinutes ?? 0,
      weightKg: entry.weightKg ?? 0
    }))
  };
};

recalcTrend(mockHealthTrendReport.petId);

const respondNotFound = (res: Response, message: string): void => {
  res.status(404).json({message});
};

export const createPetHealthServer = (): express.Express => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/pets/:petId/health', (req: Request, res: Response) => {
    const profile = petProfiles[req.params.petId];
    if (!profile) {
      return respondNotFound(res, '未找到对应宠物档案');
    }
    return res.json(profile);
  });

  app.put('/api/pets/:petId/health', (req: Request, res: Response) => {
    const existing = petProfiles[req.params.petId];
    if (!existing) {
      return respondNotFound(res, '未找到对应宠物档案');
    }

    const updated: PetHealthProfile = {
      ...existing,
      ...req.body
    };

    petProfiles[req.params.petId] = updated;
    return res.json(updated);
  });

  app.get('/api/pets/:petId/health/trends', (req: Request, res: Response) => {
    const report = trendReports[req.params.petId];
    if (!report) {
      return respondNotFound(res, '未找到健康趋势数据');
    }
    return res.json(report);
  });

  app.get('/api/pets/:petId/habit-analytics', (req: Request, res: Response) => {
    const analytics = habitAnalytics[req.params.petId];
    if (!analytics) {
      return respondNotFound(res, '未找到行为分析数据');
    }
    return res.json(analytics);
  });

  app.get('/api/pets/:petId/habits', (req: Request, res: Response) => {
    const history = habitHistory[req.params.petId] ?? [];
    const limit = Math.min(Number(req.query.limit) || 5, 30);
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    return res.json(sorted.slice(0, limit));
  });

  app.post('/api/pets/:petId/habits', (req: Request, res: Response) => {
    const {date, completedTasks = [], feedingGrams, exerciseMinutes, weightKg, notes} = req.body;
    const entry: HabitEntry = {
      id: `habit-${Date.now()}`,
      date,
      completedTasks,
      feedingGrams: typeof feedingGrams === 'number' ? feedingGrams : null,
      exerciseMinutes: typeof exerciseMinutes === 'number' ? exerciseMinutes : null,
      weightKg: typeof weightKg === 'number' ? weightKg : null,
      notes
    };
    const history = habitHistory[req.params.petId] ?? [];
    const dateIndex = history.findIndex(item => item.date === date);
    if (dateIndex >= 0) {
      history[dateIndex] = entry;
    } else {
      history.push(entry);
    }
    habitHistory[req.params.petId] = history;
    recalcTrend(req.params.petId);
    return res.status(201).json(entry);
  });

  app.get('/api/pets/:petId/feeding-reminders', (req: Request, res: Response) => {
    const reminders = feedingReminders.filter(reminder => reminder.petId === req.params.petId);
    return res.json(reminders);
  });

  app.post('/api/pets/:petId/feeding-reminders', (req: Request, res: Response) => {
    const newReminder: FeedingReminder = {
      id: `rem-${Date.now()}`,
      petId: req.params.petId,
      label: req.body.label ?? '喂食提醒',
      time: req.body.time ?? '08:00',
      enabled: req.body.enabled ?? true
    };

    feedingReminders = [...feedingReminders, newReminder];
    return res.status(201).json(newReminder);
  });

  app.patch('/api/pets/:petId/feeding-reminders/:reminderId', (req: Request, res: Response) => {
    const reminderIndex = feedingReminders.findIndex(
      reminder => reminder.id === req.params.reminderId && reminder.petId === req.params.petId
    );

    if (reminderIndex === -1) {
      return respondNotFound(res, '未找到喂食提醒');
    }

    feedingReminders[reminderIndex] = {
      ...feedingReminders[reminderIndex],
      ...req.body
    };

    return res.json(feedingReminders[reminderIndex]);
  });

  return app;
};

if (require.main === module) {
  const port = Number(process.env.PET_HEALTH_PORT ?? 4000);
  const app = createPetHealthServer();
  app.listen(port, () => {
    console.log(`🐾 Pet health server listening on http://localhost:${port}`);
  });
}
