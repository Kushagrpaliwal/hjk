import 'dotenv/config';
import pool from '../lib/db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_bets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bet_amount DECIMAL(10,2) NOT NULL,
        game_type ENUM('dice','coin','roulette') NOT NULL,
        bet_on VARCHAR(50) NOT NULL,
        status ENUM('pending','won','lost') DEFAULT 'pending',
        result VARCHAR(50) DEFAULT NULL,
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;

try {
    const [result] = await pool.query(createTableQuery);
    console.log("✅ Table 'user_bets' created successfully!");
} catch (error) {
    console.error("❌ Error:", error.message);
} finally {
    await pool.end();
}
