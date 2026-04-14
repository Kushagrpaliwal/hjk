import 'dotenv/config';
import pool from '../lib/db.js';

const tables = [
  {
    name: 'admins',
    query: `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        qr_code VARCHAR(500) DEFAULT NULL,
        upi_id VARCHAR(100) DEFAULT NULL,
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'users',
    query: `
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
    `
  },
  {
    name: 'games',
    query: `
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        period VARCHAR(50) NOT NULL,
        game_type ENUM('dice','coin','roulette') NOT NULL,
        status ENUM('pending','active','completed') DEFAULT 'pending',
        result VARCHAR(50) DEFAULT NULL,
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'user_bets',
    query: `
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
    `
  },
  {
    name: 'recharges',
    query: `
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
    `
  },
  {
    name: 'withdrawals',
    query: `
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bank_holder VARCHAR(100) NOT NULL,
        bank_account VARCHAR(50) NOT NULL,
        bank_ifsc VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
  }
];

async function createTables() {
  try {
    console.log('🚀 Starting table creation...\n');

    for (const table of tables) {
      try {
        await pool.query(table.query);
        console.log(`✅ Table '${table.name}' created successfully!`);
      } catch (error) {
        console.error(`❌ Error creating table '${table.name}':`, error.message);
      }
    }

    console.log('\n✨ Table creation complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();
