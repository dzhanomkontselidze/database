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
    await pool.query(createTableQuery);
    console.log('Database table initialized successfully, hurray!!!🗣️🔥');
};

async function addInfo(data) {
    if (!data || data.length < 7) {
        console.error("Помилка: Недостатньо даних! Треба 7 параметрів.");
        return;
    }
    const insertQuery = `
        INSERT INTO cars (car_brand, car_model, engine_type, horsepower, weight, acceleration_0_to_100, price) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(insertQuery, data); 
    console.log(`Авто ${data[0]} додано успішно!`);
}

async function deleteInfo(id) {
    if (!id) {
        console.error("Помилка: Вкажіть ID для видалення.");
        return;
    }
    const result = await pool.query('DELETE FROM cars WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        console.log(`Авто з ID ${id} не знайдено.`);
    } else {
        console.log(`Авто з ID ${id} видалено.`);
    }
}

async function updatePrice(id, newPrice) {
    if (!id || !newPrice) {
        console.error("Помилка: Треба вказати ID та нову ціну.");
        return;
    }
    const result = await pool.query('UPDATE cars SET price = $1 WHERE id = $2', [newPrice, id]);
    if (result.rowCount === 0) {
        console.log(`Авто з ID ${id} не знайдено.`);
    } else {
        console.log(`Ціна для ID ${id} тепер: ${newPrice}`);
    }
}


async function getData() {
    const { rows } = await pool.query('SELECT * FROM cars ORDER BY id ASC');
    if (rows.length === 0) {
        console.log("📭 База порожня.");
    } else {
        console.table(rows); 
    }
}

async function run() {
    const command = process.argv[2]; 

    try {
        switch (command) {
            case 'help':
                console.log("📖 Команди: list, init, add [7 параметрів], delete [id], update [id] [ціна]");
                break;

            case 'list':
                await getData(); 
                break;

            case 'init':
                console.log('🧹 Очищення та ініціалізація...');
                await pool.query('DROP TABLE IF EXISTS cars');
                await initializeDatabase();
                const defaultCar = ['Tuthill', '911K', '3.1L', '350hp', '850kg', '3.4s', '$1.1mil'];
                await addInfo(defaultCar); 
                break;

            case 'add':
                await addInfo(process.argv.slice(3));
                break;

            case 'delete':
                await deleteInfo(process.argv[3]);
                break;

            case 'update':
                await updatePrice(process.argv[3], process.argv[4]);
                break;

            default:
                console.log("Невідома команда. Спробуй 'node database.js help'");
        }
    } catch (err) {
        console.error("💀 Помилка:", err.message);
    } finally {
        await pool.end();
        console.log("🔌 З'єднання закрите.🏎️💨");
    }
}

run();
