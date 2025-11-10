// routes/pets.js - 宠物相关路由

const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticateToken } = require('../middleware');

// 所有宠物路由都需要认证
router.use(authenticateToken);

// 创建宠物档案
router.post('/', petController.createPet);

// 获取用户的所有宠物列表
router.get('/', petController.getPets);

// 获取宠物健康档案
router.get('/:petId/health', petController.getPetHealthProfile);
router.get('/:petId/health/trends', petController.getHealthTrends);

// 更新宠物基本信息
router.put('/:petId', petController.updatePet);

// 疫苗记录
router.post('/:petId/vaccines', petController.addVaccine);

// 体检报告
router.post('/:petId/checkups', petController.addCheckup);

// 过敏史
router.post('/:petId/allergies', petController.addAllergy);

// 喂食计划
router.put('/:petId/feeding-plan', petController.updateFeedingPlan);

// 运动记录
router.post('/:petId/exercises', petController.addExercise);

// 习惯打卡
router.get('/:petId/habits', petController.getHabitEntries);
router.post('/:petId/habits', petController.recordHabitEntry);

module.exports = router;
