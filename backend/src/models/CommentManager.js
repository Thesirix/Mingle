const AbstractManager = require("./AbstractManager");

class CommentManager extends AbstractManager {
  constructor() {
    super({ table: "comments" });
  }

  async findByServiceId(serviceId) {
    const [rows] = await this.database.query(
      `SELECT cm.id, cm.service_id, cm.user_id, cm.content, cm.created_at,
              u.username, u.avatar
       FROM comments cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.service_id = ?
       ORDER BY cm.created_at DESC`,
      [serviceId]
    );
    return rows;
  }

  async findWithAuthor(id) {
    const [rows] = await this.database.query(
      `SELECT cm.id, cm.service_id, cm.user_id, cm.content, cm.created_at,
              u.username, u.avatar
       FROM comments cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  async insert({ service_id: serviceId, user_id: userId, content }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (service_id, user_id, content) VALUES (?, ?, ?)`,
      [serviceId, userId, content]
    );
    return result.insertId;
  }

  update(id, data) {
    return this.updateFields(id, data, ["content"]);
  }
}

module.exports = CommentManager;
