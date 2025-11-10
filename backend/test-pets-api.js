// test-pets-api.js - 宠物API测试脚本
// 使用方法: node test-pets-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// 颜色输出辅助函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

// 测试步骤1: 注册用户获取token
async function step1_RegisterUser() {
  console.log(colors.blue('\n=== 步骤1: 注册用户获取Token ==='));
  
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: '测试用户',
      email: testEmail,
      password: '123456'
    });

    authToken = response.data.token;
    console.log(colors.green('✅ 注册成功'));
    console.log('用户ID:', response.data.user.id);
    console.log('Token:', authToken.substring(0, 50) + '...');
    return true;
  } catch (error) {
    console.log(colors.red('❌ 注册失败'));
    if (error.response) {
      console.log('错误信息:', error.response.data);
    } else {
      console.log('错误:', error.message);
    }
    return false;
  }
}

// 测试步骤2: 创建宠物
async function step2_CreatePet() {
  console.log(colors.blue('\n=== 步骤2: 创建宠物档案 ==='));
  
  if (!authToken) {
    console.log(colors.red('❌ 缺少Token，请先执行步骤1'));
    return null;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/pets`,
      {
        name: '可可',
        species: 'dog',
        ageInMonths: 18
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log(colors.green('✅ 创建宠物成功'));
    console.log('宠物信息:', JSON.stringify(response.data, null, 2));
    return response.data.id;
  } catch (error) {
    console.log(colors.red('❌ 创建宠物失败'));
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    } else {
      console.log('错误:', error.message);
    }
    return null;
  }
}

// 测试步骤3: 获取宠物列表
async function step3_GetPets() {
  console.log(colors.blue('\n=== 步骤3: 获取宠物列表 ==='));
  
  if (!authToken) {
    console.log(colors.red('❌ 缺少Token，请先执行步骤1'));
    return;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/pets`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log(colors.green('✅ 获取宠物列表成功'));
    console.log('宠物数量:', response.data.length);
    console.log('宠物列表:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(colors.red('❌ 获取宠物列表失败'));
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    } else {
      console.log('错误:', error.message);
    }
  }
}

// 测试步骤4: 获取宠物健康档案
async function step4_GetPetHealth(petId) {
  console.log(colors.blue('\n=== 步骤4: 获取宠物健康档案 ==='));
  
  if (!authToken) {
    console.log(colors.red('❌ 缺少Token，请先执行步骤1'));
    return;
  }

  if (!petId) {
    console.log(colors.red('❌ 缺少宠物ID，请先执行步骤2'));
    return;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/pets/${petId}/health`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    console.log(colors.green('✅ 获取健康档案成功'));
    console.log('宠物名称:', response.data.name);
    console.log('物种:', response.data.species);
    console.log('疫苗记录数:', response.data.vaccines.length);
    console.log('体检记录数:', response.data.checkups.length);
    console.log('过敏记录数:', response.data.allergies.length);
    console.log('运动记录数:', response.data.exerciseRecords.length);
    console.log('\n完整数据:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(colors.red('❌ 获取健康档案失败'));
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    } else {
      console.log('错误:', error.message);
    }
  }
}

// 测试步骤5: 测试错误情况
async function step5_TestErrors() {
  console.log(colors.blue('\n=== 步骤5: 测试错误处理 ==='));
  
  // 测试1: 没有token
  console.log('\n测试1: 不带Token创建宠物');
  try {
    await axios.post(`${BASE_URL}/pets`, {
      name: '测试',
      species: 'cat'
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(colors.green('✅ 正确返回401未授权错误'));
    } else {
      console.log(colors.red('❌ 错误处理不正确'));
    }
  }

  // 测试2: 缺少必填字段
  console.log('\n测试2: 缺少必填字段');
  try {
    await axios.post(
      `${BASE_URL}/pets`,
      { species: 'dog' }, // 缺少name
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(colors.green('✅ 正确返回400验证错误'));
      console.log('错误信息:', error.response.data.message);
    } else {
      console.log(colors.red('❌ 错误处理不正确'));
    }
  }

  // 测试3: 无效的物种
  console.log('\n测试3: 无效的物种值');
  try {
    await axios.post(
      `${BASE_URL}/pets`,
      { name: '测试', species: 'invalid' },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(colors.green('✅ 正确返回400验证错误'));
      console.log('错误信息:', error.response.data.message);
    } else {
      console.log(colors.red('❌ 错误处理不正确'));
    }
  }
}

// 主测试函数
async function runTests() {
  console.log(colors.yellow('\n🚀 开始测试宠物API功能...\n'));
  console.log(colors.yellow('确保后端服务器正在运行: http://localhost:3000\n'));

  // 步骤1: 注册用户
  const registerSuccess = await step1_RegisterUser();
  if (!registerSuccess) {
    console.log(colors.red('\n❌ 测试终止：无法获取Token'));
    return;
  }

  // 等待一下确保数据库操作完成
  await new Promise(resolve => setTimeout(resolve, 500));

  // 步骤2: 创建宠物
  const petId = await step2_CreatePet();
  
  // 等待一下确保数据库操作完成
  await new Promise(resolve => setTimeout(resolve, 500));

  // 步骤3: 获取宠物列表
  await step3_GetPets();

  // 步骤4: 获取健康档案
  if (petId) {
    await step4_GetPetHealth(petId);
  }

  // 步骤5: 测试错误处理
  await step5_TestErrors();

  console.log(colors.green('\n\n✅ 所有测试完成！'));
}

// 运行测试
runTests().catch(error => {
  console.log(colors.red('\n❌ 测试过程中发生错误:'));
  console.log(error.message);
  process.exit(1);
});

