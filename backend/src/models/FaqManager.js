const AbstractManager = require("./AbstractManager");

class FaqManager extends AbstractManager {
  constructor() {
    super({ table: "faq" });
  }

  async findAll() {
    const [rows] = await this.database.query(
      `SELECT id, title, content FROM ${this.table} ORDER BY id`
    );
    return rows;
  }

  async insert({ title, content }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (title, content) VALUES (?, ?)`,
      [title, content]
    );
    return result.insertId;
  }

  update(id, data) {
    return this.updateFields(id, data, ["title", "content"]);
  }
}

module.exports = FaqManager;
