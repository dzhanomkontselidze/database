import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: `${process.env.DB_URL}`
});

const initializeDatabase = async () => {
    console.log('Initializing database, bzzzzzzzzzzzz...');
    
    // Виправив назву таблиці на cars, додав типи для price та назву для BOOLEAN
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        car_brand TEXT NOT NULL,
        car_model TEXT NOT NULL,
        engine_type TEXT NOT NULL,
        horsepower TEXT NOT NULL,
        weight TEXT,
        acceleration_0_to_100 TEXT,
        price TEXT, 
        is_available BOOLEAN DEFAULT TRUE,
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
    console.log('Adding cars info...');
    const insertQuery = `
        INSERT INTO cars (car_brand, car_model, engine_type, horsepower, weight, acceleration_0_to_100, price) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
        'Tuthill', 
        '911K', 
        '3.1L Flat-6', 
        '350hp at 11K RPM', 
        '850KG', 
        '3.4s', 
        '$1.1mil'
    ];
    
    await pool.query(insertQuery, values);
}

async function getData() {
    console.log("Fetching data from database...");
    const { rows } = await pool.query('SELECT * FROM cars');
    
    if (rows.length === 0) {
        console.log("The table is empty. 📭");
    } else {
        console.log("Rows =>");
        console.table(rows); 
    }
}

async function run() {
    try {
        console.log('Dropping old table to refresh structure...');
        await pool.query('DROP TABLE IF EXISTS cars');

        await initializeDatabase();

        await addInfo();

        await getData();

    } catch (err) {
        console.error("Everything went wrong! 💀", err.message);
    } finally {
        await pool.end();
        console.log("Connection closed. Vroom-vroom! 🏎️💨");
    }
}

run();
