const AbstractManager = require("./AbstractManager");

// Le hash du mot de passe ne doit jamais quitter la couche modèle
const PROFILE_FIELDS =
  "id, username, mail, localisation, avatar, biographie, service_type, is_admin, created_at";
const SUMMARY_FIELDS = "id, username, localisation, avatar";

class UserManager extends AbstractManager {
  constructor() {
    super({ table: "users" });
  }

  async find(id) {
    const [rows] = await this.database.query(
      `SELECT ${PROFILE_FIELDS} FROM ${this.table} WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findAll({ search } = {}) {
    const where = search ? "WHERE username LIKE ?" : "";
    const [rows] = await this.database.query(
      `SELECT ${SUMMARY_FIELDS} FROM ${this.table} ${where} ORDER BY username LIMIT 20`,
      search ? [`%${search}%`] : []
    );
    return rows;
  }

  async findByEmailWithPassword(mail) {
    const [rows] = await this.database.query(
      `SELECT id, user_pass, is_admin FROM ${this.table} WHERE mail = ?`,
      [mail]
    );
    return rows[0] ?? null;
  }

  async insert({ username, mail, localisation, user_pass: userPass }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (username, mail, localisation, user_pass) VALUES (?, ?, ?, ?)`,
      [username, mail, localisation, userPass]
    );
    return result.insertId;
  }

  update(id, data) {
    return this.updateFields(id, data, [
      "username",
      "mail",
      "localisation",
      "user_pass",
      "avatar",
      "biographie",
      "service_type",
    ]);
  }
}

module.exports = UserManager;
