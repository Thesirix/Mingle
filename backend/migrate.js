require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

const migrate = async () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!/^\w+$/.test(DB_NAME ?? "")) {
    throw new Error("DB_NAME doit être renseigné et ne contenir que [A-Za-z0-9_]");
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    await connection.query(
      `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${DB_NAME}\``);

    const sql = fs.readFileSync(path.join(__dirname, "database.sql"), "utf8");
    await connection.query(sql);

    console.info(`Base de données "${DB_NAME}" créée et peuplée.`);
  } finally {
    await connection.end();
  }
};

migrate().catch((err) => {
  console.error("Échec de la migration :", err.message);
  process.exit(1);
});
