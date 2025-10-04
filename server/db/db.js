import { Pool } from "pg";
const pool = new Pool({
  host: "db",
  port: 5432,
  user: "yernar1121",
  password: "qeqeq123",
  database: "db123",
});

export default pool;
