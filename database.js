import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: `${process.env.DB_URL}`
});

const initializeDatabase = async () => {
    console.log('Initializing database, bzzzzzzzzzzzz...');
    
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        group_name TEXT NOT NULL,
        life_problems TEXT NOT NULL,
        additional_info TEXT,
        hobby TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Database table initialized successfully, hurray!!!🗣️🔥');
    } catch (error) {
        console.error('Error initializing database, 💀💀💀:', error.message);
        throw error;
    }
};

async function addInfo() {
    console.log('Adding student info...');
    const insertQuery = `
        INSERT INTO students (first_name, last_name, group_name, life_problems, additional_info, hobby) 
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
        'Dzhano', 
        'Konzelidze', 
        'IPZs-25-1', 
        'to understand programming', 
        'video-editor, but for some reason decided to learn programming', 
        'making cinematics, and virtual photos'
    ];
    
    await pool.query(insertQuery, values);
}

async function getData() {
    console.log("Fetching data from database...");
    const { rows } = await pool.query('SELECT * FROM students');
    
    if (rows.length === 0) {
        console.log("The table is empty. 📭");
    } else {
        console.log("Rows =>");
        console.table(rows); // Виведе гарну табличку в консоль
    }
}

async function run() {
    try {
        // 1. Очищаємо стару таблицю, щоб уникнути конфліктів структури
        console.log('Dropping old table to refresh structure...');
        await pool.query('DROP TABLE IF EXISTS students');

        // 2. Створюємо нову таблицю
        await initializeDatabase();

        // 3. Додаємо дані
        await addInfo();

        // 4. Виводимо результат
        await getData();

    } catch (err) {
        console.error("Everything went wrong! 💀", err.message);
    } finally {
        // Закриваємо підключення, щоб скрипт завершився сам
        await pool.end();
        console.log("Connection closed. Bye-bye! 👋");
    }
}

run();