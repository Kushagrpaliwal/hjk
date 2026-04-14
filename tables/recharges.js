import 'dotenv/config';
import pool from '../lib/db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS recharges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        transaction_id VARCHAR(100) NOT NULL UNIQUE,
        order_no VARCHAR(100) NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        payment_mode VARCHAR(50) NOT NULL,
        screenshot VARCHAR(500) DEFAULT NULL,
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;

try {
    const [result] = await pool.query(createTableQuery);
    console.log("✅ Table 'recharges' created successfully!");
} catch (error) {
    console.error("❌ Error:", error.message);
} finally {
    await pool.end();
}
