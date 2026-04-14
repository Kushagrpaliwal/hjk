import 'dotenv/config';
import pool from '../lib/db.js';

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

try {
    const [result] = await pool.query(createTableQuery);
    console.log("Table 'users' created successfully!");
} catch (error) {
    console.error("Error:", error.message);
} finally {
    await pool.end();
}
