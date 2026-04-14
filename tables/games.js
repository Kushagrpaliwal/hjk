import 'dotenv/config';
import pool from '../lib/db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        period VARCHAR(50) NOT NULL,
        game_type VARCHAR(60) DEFAULT NULL,
        status INT DEFAULT 0,
        result VARCHAR(50) DEFAULT NULL,
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

try {
    const [result] = await pool.query(createTableQuery);
    console.log("✅ Table 'games' created successfully!");
} catch (error) {
    console.error("❌ Error:", error.message);
} finally {
    await pool.end();
}
