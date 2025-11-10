// controllers/petController.js - 宠物相关控制器

const pool = require('../config/database');

const padZero = (value) => value.toString().padStart(2, '0');
const formatDateOnly = (dateObj) =>
  `${dateObj.getFullYear()}-${padZero(dateObj.getMonth() + 1)}-${padZero(dateObj.getDate())}`;

const normalizeDateInput = (value) => {
  if (!value) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return formatDateOnly(parsed);
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

/**
 * 创建宠物档案
 * POST /api/pets
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
async function createPet(req, res) {
  try {
    const userId = req.user.id; // 从认证中间件获取用户ID
    const { name, species, ageInMonths, breed, weightKg, avatarUrl } = req.body;

    // 1. 验证输入
    if (!name || !species) {
      return res.status(400).json({ message: '请填写宠物昵称和物种' });
    }

    if (!['dog', 'cat', 'other'].includes(species)) {
      return res.status(400).json({ message: '物种必须是 dog、cat 或 other' });
    }

    // 2. 插入宠物基本信息
    const [insertResult] = await pool.query(
      `INSERT INTO pets (user_id, name, species, age_in_months, breed, weight_kg, avatar_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        name.trim(), 
        species, 
        ageInMonths || null, 
        breed || null,
        weightKg || null,
        avatarUrl || null
      ]
    );

    const petId = insertResult.insertId;

    // 3. 获取刚创建的宠物信息
    const [petRows] = await pool.query(
      `SELECT id, name, species, age_in_months, breed, weight_kg, avatar_url, created_at 
       FROM pets WHERE id = ?`,
      [petId]
    );

    const pet = petRows[0];

    // 4. 转换为前端期望的格式
    const response = {
      id: pet.id.toString(),
      name: pet.name,
      species: pet.species,
      ageInMonths: pet.age_in_months,
      avatarUrl: pet.avatar_url || undefined
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('创建宠物失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 获取宠物健康档案
 * GET /api/pets/:petId/health
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
async function getPetHealthProfile(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;

    console.log('获取健康档案 - userId:', userId, 'petId:', petId);

    // 将petId转换为整数（如果它是字符串数字）
    const petIdInt = parseInt(petId, 10);
    if (isNaN(petIdInt)) {
      return res.status(400).json({ message: '无效的宠物ID格式' });
    }

    // 1. 验证宠物是否存在且属于当前用户
    const [petRows] = await pool.query(
      `SELECT id, name, species, age_in_months, weight_kg, breed 
       FROM pets WHERE id = ? AND user_id = ?`,
      [petIdInt, userId]
    );

    console.log('查询结果:', petRows.length, '条记录');

    if (petRows.length === 0) {
      // 检查宠物是否存在（可能不属于当前用户）
      const [allPetRows] = await pool.query(
        'SELECT id, user_id FROM pets WHERE id = ?',
        [petIdInt]
      );
      if (allPetRows.length === 0) {
        return res.status(404).json({ message: '未找到该宠物档案，宠物不存在' });
      } else {
        return res.status(403).json({ message: '无权访问该宠物档案' });
      }
    }

    const pet = petRows[0];

    // 2. 获取疫苗记录
    const [vaccines] = await pool.query(
      `SELECT id, name, DATE_FORMAT(date, '%Y-%m-%d') as date, clinic, vet, effect, precautions, notes 
       FROM vaccine_records 
       WHERE pet_id = ? 
       ORDER BY date DESC`,
      [petIdInt]
    );

    // 3. 获取体检报告
    const [checkups] = await pool.query(
      `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, clinic, vet, summary, details, report_file_url, weight_kg 
       FROM medical_checkups 
       WHERE pet_id = ? 
       ORDER BY date DESC`,
      [petIdInt]
    );

    // 4. 获取过敏史
    const [allergies] = await pool.query(
      `SELECT id, allergen, reaction, severity, notes 
       FROM allergy_records 
       WHERE pet_id = ?`,
      [petIdInt]
    );

    // 5. 获取喂食计划
    const [feedingPlans] = await pool.query(
      `SELECT food, calories_per_meal, schedule, notes 
       FROM feeding_plans 
       WHERE pet_id = ?`,
      [petIdInt]
    );

    // 6. 获取运动记录
    const [exercises] = await pool.query(
      `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date, activity, duration_minutes, intensity 
       FROM exercise_records 
       WHERE pet_id = ? 
       ORDER BY date DESC 
       LIMIT 10`,
      [petIdInt]
    );

    // 7. 计算年龄（年）
    const ageInYears = pet.age_in_months ? Math.floor(pet.age_in_months / 12) : 0;

    // 8. 构建响应数据
    const feedingPlan = feedingPlans.length > 0 ? feedingPlans[0] : {
      food: '',
      calories_per_meal: 0,
      schedule: [],
      notes: null
    };

    // 解析JSON格式的schedule
    let scheduleArray = [];
    if (feedingPlan.schedule) {
      try {
        scheduleArray = typeof feedingPlan.schedule === 'string' 
          ? JSON.parse(feedingPlan.schedule) 
          : feedingPlan.schedule;
      } catch (e) {
        scheduleArray = [];
      }
    }

    const response = {
      id: pet.id.toString(),
      name: pet.name,
      species: pet.species === 'dog' ? '犬' : pet.species === 'cat' ? '猫' : pet.species,
      breed: pet.breed || '未填写',
      age: ageInYears,
      weightKg: pet.weight_kg ? parseFloat(pet.weight_kg) : 0,
      vaccines: vaccines.map(v => ({
        id: v.id.toString(),
        name: v.name,
        date: v.date,
        clinic: v.clinic || '',
        vet: v.vet || '',
        effect: v.effect || '',
        precautions: v.precautions || '',
        notes: v.notes || undefined
      })),
      checkups: checkups.map(c => ({
        id: c.id.toString(),
        date: c.date,
        clinic: c.clinic || '',
        vet: c.vet || '',
        summary: c.summary || '',
        details: c.details || '',
        reportFileUrl: c.report_file_url || '',
        weightKg: c.weight_kg ? parseFloat(c.weight_kg) : 0
      })),
      allergies: allergies.map(a => ({
        id: a.id.toString(),
        allergen: a.allergen,
        reaction: a.reaction || '',
        severity: a.severity,
        notes: a.notes || undefined
      })),
      feedingPlan: {
        food: feedingPlan.food || '',
        caloriesPerMeal: feedingPlan.calories_per_meal || 0,
        schedule: scheduleArray,
        notes: feedingPlan.notes || undefined
      },
      exerciseRecords: exercises.map(e => ({
        id: e.id.toString(),
        date: e.date,
        activity: e.activity,
        durationMinutes: e.duration_minutes,
        intensity: e.intensity
      }))
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('获取宠物健康档案失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 获取近七天健康趋势
 * GET /api/pets/:petId/health/trends
 */
async function getHealthTrends(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const petIdInt = parseInt(petId, 10);

    if (Number.isNaN(petIdInt)) {
      return res.status(400).json({ message: '无效的宠物ID格式' });
    }

    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petIdInt, userId]
    );
    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const [entries] = await pool.query(
      `SELECT DATE_FORMAT(entry_date, '%Y-%m-%d') as date, feeding_grams, exercise_minutes, weight_kg
       FROM habit_entries
       WHERE pet_id = ?
       ORDER BY entry_date DESC
       LIMIT 14`,
      [petIdInt]
    );

    const dateMap = new Map();
    entries.forEach(entry => {
      dateMap.set(entry.date, entry);
    });

    const points = [];
    const today = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() - i);
      const label = formatDateOnly(dateObj);
      const found = dateMap.get(label);
      points.push({
        date: label,
        feedingGrams: found?.feeding_grams ?? 0,
        exerciseMinutes: found?.exercise_minutes ?? 0,
        weightKg: found?.weight_kg ? parseFloat(found.weight_kg) : 0
      });
    }

    res.status(200).json({
      petId: petIdInt.toString(),
      points
    });
  } catch (error) {
    console.error('获取健康趋势失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 获取用户的所有宠物列表
 * GET /api/pets
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
async function getPets(req, res) {
  try {
    const userId = req.user.id;

    const [pets] = await pool.query(
      `SELECT id, name, species, age_in_months, avatar_url, created_at 
       FROM pets 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    const response = pets.map(pet => ({
      id: pet.id.toString(),
      name: pet.name,
      species: pet.species,
      ageInMonths: pet.age_in_months,
      avatarUrl: pet.avatar_url || undefined
    }));

    res.status(200).json(response);

  } catch (error) {
    console.error('获取宠物列表失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 更新宠物基本信息
 * PUT /api/pets/:petId
 */
async function updatePet(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const { name, breed, ageInMonths, weightKg } = req.body;

    // 验证宠物是否属于当前用户
    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    // 更新宠物信息
    await pool.query(
      `UPDATE pets SET name = ?, breed = ?, age_in_months = ?, weight_kg = ? 
       WHERE id = ? AND user_id = ?`,
      [name, breed, ageInMonths || null, weightKg || null, petId, userId]
    );

    res.status(200).json({ message: '更新成功' });
  } catch (error) {
    console.error('更新宠物失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 添加疫苗记录
 * POST /api/pets/:petId/vaccines
 */
async function addVaccine(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const { name, date, clinic, vet, effect, precautions, notes } = req.body;

    // 验证宠物是否属于当前用户
    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const [result] = await pool.query(
      `INSERT INTO vaccine_records (pet_id, name, date, clinic, vet, effect, precautions, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [petId, name, date, clinic || null, vet || null, effect || null, precautions || null, notes || null]
    );

    res.status(201).json({
      id: result.insertId.toString(),
      name,
      date,
      clinic: clinic || '',
      vet: vet || '',
      effect: effect || '',
      precautions: precautions || '',
      notes: notes || undefined
    });
  } catch (error) {
    console.error('添加疫苗记录失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 添加体检报告
 * POST /api/pets/:petId/checkups
 */
async function addCheckup(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const { date, clinic, vet, summary, details, reportFileUrl, weightKg } = req.body;

    // 验证宠物是否属于当前用户
    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const [result] = await pool.query(
      `INSERT INTO medical_checkups (pet_id, date, clinic, vet, summary, details, report_file_url, weight_kg) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [petId, date, clinic || null, vet || null, summary || '', details || null, reportFileUrl || null, weightKg || null]
    );

    res.status(201).json({
      id: result.insertId.toString(),
      date,
      clinic: clinic || '',
      vet: vet || '',
      summary: summary || '',
      details: details || '',
      reportFileUrl: reportFileUrl || '',
      weightKg: weightKg || 0
    });
  } catch (error) {
    console.error('添加体检报告失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 添加过敏史
 * POST /api/pets/:petId/allergies
 */
async function addAllergy(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const { allergen, reaction, severity, notes } = req.body;

    // 验证宠物是否属于当前用户
    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const [result] = await pool.query(
      `INSERT INTO allergy_records (pet_id, allergen, reaction, severity, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [petId, allergen, reaction || '', severity || 'low', notes || null]
    );

    res.status(201).json({
      id: result.insertId.toString(),
      allergen,
      reaction: reaction || '',
      severity: severity || 'low',
      notes: notes || undefined
    });
  } catch (error) {
    console.error('添加过敏史失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 更新喂食计划
 * PUT /api/pets/:petId/feeding-plan
 */
async function updateFeedingPlan(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const { food, caloriesPerMeal, schedule, notes } = req.body;

    // 验证宠物是否属于当前用户
    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    // 检查是否已存在喂食计划
    const [existing] = await pool.query(
      'SELECT id FROM feeding_plans WHERE pet_id = ?',
      [petId]
    );

    const scheduleJson = JSON.stringify(schedule || []);

    if (existing.length > 0) {
      // 更新现有计划
      await pool.query(
        `UPDATE feeding_plans SET food = ?, calories_per_meal = ?, schedule = ?, notes = ? 
         WHERE pet_id = ?`,
        [food || '', caloriesPerMeal || 0, scheduleJson, notes || null, petId]
      );
    } else {
      // 创建新计划
      await pool.query(
        `INSERT INTO feeding_plans (pet_id, food, calories_per_meal, schedule, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [petId, food || '', caloriesPerMeal || 0, scheduleJson, notes || null]
      );
    }

    res.status(200).json({
      food: food || '',
      caloriesPerMeal: caloriesPerMeal || 0,
      schedule: schedule || [],
      notes: notes || undefined
    });
  } catch (error) {
    console.error('更新喂食计划失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 添加运动记录
 * POST /api/pets/:petId/exercises
 */
async function addExercise(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const { date, activity, durationMinutes, intensity } = req.body;

    // 验证宠物是否属于当前用户
    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petId, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const [result] = await pool.query(
      `INSERT INTO exercise_records (pet_id, date, activity, duration_minutes, intensity) 
       VALUES (?, ?, ?, ?, ?)`,
      [petId, date, activity, durationMinutes, intensity || 'medium']
    );

    res.status(201).json({
      id: result.insertId.toString(),
      date,
      activity,
      durationMinutes,
      intensity: intensity || 'medium'
    });
  } catch (error) {
    console.error('添加运动记录失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 记录/更新每日习惯打卡
 * POST /api/pets/:petId/habits
 */
async function recordHabitEntry(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const petIdInt = parseInt(petId, 10);
    const { date, feedingGrams, exerciseMinutes, weightKg, completedTasks = [], notes } = req.body;

    if (Number.isNaN(petIdInt)) {
      return res.status(400).json({ message: '无效的宠物ID' });
    }

    const entryDate = normalizeDateInput(date) || formatDateOnly(new Date());
    if (!entryDate) {
      return res.status(400).json({ message: '请提供有效的日期（YYYY-MM-DD）' });
    }

    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petIdInt, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const feedingValue = parseNumber(feedingGrams);
    const exerciseValue = parseNumber(exerciseMinutes);
    const weightValue = parseNumber(weightKg);

    await pool.query(
      `INSERT INTO habit_entries (pet_id, entry_date, feeding_grams, exercise_minutes, weight_kg, completed_tasks, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         feeding_grams = VALUES(feeding_grams),
         exercise_minutes = VALUES(exercise_minutes),
         weight_kg = VALUES(weight_kg),
         completed_tasks = VALUES(completed_tasks),
         notes = VALUES(notes),
         updated_at = CURRENT_TIMESTAMP`,
      [
        petIdInt,
        entryDate,
        feedingValue,
        exerciseValue,
        weightValue,
        JSON.stringify(Array.isArray(completedTasks) ? completedTasks : []),
        notes || null
      ]
    );

    const [rows] = await pool.query(
      `SELECT id,
              DATE_FORMAT(entry_date, '%Y-%m-%d') as date,
              feeding_grams,
              exercise_minutes,
              weight_kg,
              completed_tasks,
              notes
       FROM habit_entries
       WHERE pet_id = ? AND entry_date = ?`,
      [petIdInt, entryDate]
    );

    const entry = rows[0];
    res.status(201).json({
      id: entry.id.toString(),
      date: entry.date,
      feedingGrams: entry.feeding_grams ?? null,
      exerciseMinutes: entry.exercise_minutes ?? null,
      weightKg: entry.weight_kg ? parseFloat(entry.weight_kg) : null,
      notes: entry.notes || '',
      completedTasks: entry.completed_tasks ? JSON.parse(entry.completed_tasks) : []
    });
  } catch (error) {
    console.error('记录每日习惯失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 获取近期习惯打卡
 * GET /api/pets/:petId/habits?limit=5
 */
async function getHabitEntries(req, res) {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    const petIdInt = parseInt(petId, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 30);

    if (Number.isNaN(petIdInt)) {
      return res.status(400).json({ message: '无效的宠物ID' });
    }

    const [petRows] = await pool.query(
      'SELECT id FROM pets WHERE id = ? AND user_id = ?',
      [petIdInt, userId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ message: '未找到该宠物档案' });
    }

    const [rows] = await pool.query(
      `SELECT id,
              DATE_FORMAT(entry_date, '%Y-%m-%d') as date,
              feeding_grams,
              exercise_minutes,
              weight_kg,
              completed_tasks,
              notes
       FROM habit_entries
       WHERE pet_id = ?
       ORDER BY entry_date DESC
       LIMIT ?`,
      [petIdInt, limit]
    );

    const history = rows.map(entry => ({
      id: entry.id.toString(),
      date: entry.date,
      feedingGrams: entry.feeding_grams ?? null,
      exerciseMinutes: entry.exercise_minutes ?? null,
      weightKg: entry.weight_kg ? parseFloat(entry.weight_kg) : null,
      notes: entry.notes || '',
      completedTasks: entry.completed_tasks ? JSON.parse(entry.completed_tasks) : []
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error('获取习惯打卡失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

module.exports = {
  createPet,
  getPetHealthProfile,
  getHealthTrends,
  getPets,
  updatePet,
  addVaccine,
  addCheckup,
  addAllergy,
  updateFeedingPlan,
  addExercise,
  recordHabitEntry,
  getHabitEntries
};
