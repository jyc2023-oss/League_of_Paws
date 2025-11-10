// config/database.js - 数据库连接配置

const mysql = require('mysql2/promise');

// 数据库连接池配置
let pool;

try {
  pool = mysql.createPool({
    host: 'localhost',           // 您的 MySQL 主机地址 (通常是 'localhost')
    user: 'root',                 // 您的 MySQL 用户名 (例如 'root')
    password: 'Chenjianyi666+',   // 您的 MySQL 密码
    database: 'my_app_db',        // 数据库名称
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('✅ 成功连接到 MySQL 数据库');
  initializeSchema().catch(err => {
    console.error('⚠️ 数据库结构升级失败:', err);
  });
} catch (error) {
  console.error('❌ 数据库连接失败:', error);
  process.exit(1); // 启动失败时退出
}

async function initializeSchema() {
  const connection = await pool.getConnection();
  try {
    const ensureColumn = async (table, column, definition) => {
      const [rows] = await connection.query(
        `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
        [column]
      );
      if (rows.length === 0) {
        await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
      }
    };

    // 增加疫苗记录的扩展字段
    await ensureColumn(
      'vaccine_records',
      'effect',
      `effect TEXT NULL COMMENT '疫苗作用/防护范围'`
    );
    await ensureColumn(
      'vaccine_records',
      'precautions',
      `precautions TEXT NULL COMMENT '接种后的注意事项'`
    );

    // 增加体检报告扩展字段
    await ensureColumn(
      'medical_checkups',
      'details',
      `details TEXT NULL COMMENT '体检具体项目/内容'`
    );
    await ensureColumn(
      'medical_checkups',
      'report_file_url',
      `report_file_url VARCHAR(500) NULL COMMENT '体检报告PDF链接'`
    );

    // 创建每日习惯打卡表（若不存在）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS habit_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pet_id INT NOT NULL,
        entry_date DATE NOT NULL,
        feeding_grams INT DEFAULT NULL,
        exercise_minutes INT DEFAULT NULL,
        weight_kg DECIMAL(5,2) DEFAULT NULL,
        completed_tasks JSON DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_pet_entry_date (pet_id, entry_date),
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
        INDEX idx_pet_entry_date (pet_id, entry_date)
      )
    `);
  } finally {
    connection.release();
  }
}

module.exports = pool;
