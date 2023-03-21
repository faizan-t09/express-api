import * as mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: "mysqlServer",
});

export default connectionPool;
