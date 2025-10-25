import express, {Request, Response} from 'express';
import cors from 'cors';
import {
  HealthTrendReport,
  PetHealthProfile,
  FeedingReminder,
  HabitAnalytics,
  mockPetHealthProfile,
  mockHealthTrendReport,
  mockFeedingReminders,
  mockHabitAnalytics
} from '@app/types';

type PetHealthMap = Record<string, PetHealthProfile>;
type TrendMap = Record<string, HealthTrendReport>;

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
