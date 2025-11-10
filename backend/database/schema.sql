-- 宠物建档相关的数据库表结构

-- 1. 宠物基本信息表
CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL COMMENT '宠物昵称',
  species ENUM('dog', 'cat', 'other') NOT NULL COMMENT '物种：dog=犬类, cat=猫类, other=其他',
  breed VARCHAR(100) DEFAULT NULL COMMENT '品种',
  age_in_months INT DEFAULT NULL COMMENT '月龄',
  avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  weight_kg DECIMAL(5,2) DEFAULT NULL COMMENT '体重（公斤）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物基本信息表';

-- 2. 疫苗记录表
CREATE TABLE IF NOT EXISTS vaccine_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  name VARCHAR(200) NOT NULL COMMENT '疫苗名称',
  date DATE NOT NULL COMMENT '接种日期',
  clinic VARCHAR(200) DEFAULT NULL COMMENT '医院名称',
  vet VARCHAR(100) DEFAULT NULL COMMENT '医生姓名',
  notes TEXT DEFAULT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_id (pet_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='疫苗记录表';

-- 3. 体检报告表
CREATE TABLE IF NOT EXISTS medical_checkups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  date DATE NOT NULL COMMENT '体检日期',
  clinic VARCHAR(200) DEFAULT NULL COMMENT '医院名称',
  vet VARCHAR(100) DEFAULT NULL COMMENT '医生姓名',
  summary TEXT DEFAULT NULL COMMENT '体检总结',
  weight_kg DECIMAL(5,2) DEFAULT NULL COMMENT '体检时体重（公斤）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_id (pet_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='体检报告表';

-- 4. 过敏史记录表
CREATE TABLE IF NOT EXISTS allergy_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  allergen VARCHAR(200) NOT NULL COMMENT '过敏原',
  reaction VARCHAR(500) DEFAULT NULL COMMENT '过敏反应',
  severity ENUM('low', 'medium', 'high') DEFAULT 'low' COMMENT '严重程度',
  notes TEXT DEFAULT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_id (pet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='过敏史记录表';

-- 5. 喂食计划表
CREATE TABLE IF NOT EXISTS feeding_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL UNIQUE COMMENT '每个宠物只有一个喂食计划',
  food VARCHAR(200) DEFAULT NULL COMMENT '食物名称',
  calories_per_meal INT DEFAULT NULL COMMENT '每餐卡路里',
  schedule JSON DEFAULT NULL COMMENT '喂食时间表，JSON数组格式，如 ["07:30", "12:30", "18:30"]',
  notes TEXT DEFAULT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_id (pet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='喂食计划表';

-- 6. 运动记录表
CREATE TABLE IF NOT EXISTS exercise_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  date DATE NOT NULL COMMENT '运动日期',
  activity VARCHAR(200) NOT NULL COMMENT '运动类型',
  duration_minutes INT NOT NULL COMMENT '持续时间（分钟）',
  intensity ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '运动强度',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_id (pet_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运动记录表';

