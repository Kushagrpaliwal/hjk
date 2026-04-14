import 'dotenv/config';
import pool from '../lib/db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bank_holder VARCHAR(100) NOT NULL,
        bank_account VARCHAR(50) NOT NULL,
        bank_ifsc VARCHAR(20) NOT NULL,
        upi_id VARCHAR(100) DEFAULT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;

try {
    const [result] = await pool.query(createTableQuery);
    console.log("✅ Table 'withdrawals' created successfully!");
} catch (error) {
    console.error("❌ Error:", error.message);
} finally {
    await pool.end();
}