import pg from "pg";
import 'dotenv/config.js'

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});


export default pool