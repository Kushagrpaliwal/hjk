import 'dotenv/config';
import pool from '../lib/db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        wallet DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('active','inactive','banned') DEFAULT 'active',
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

try {
    const [result] = await pool.query(createTableQuery);
    console.log("✅ Table 'users' created successfully!");
} catch (error) {
    console.error("❌ Error:", error.message);
} finally {
    await pool.end();
}
