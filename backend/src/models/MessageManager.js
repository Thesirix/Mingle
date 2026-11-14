const AbstractManager = require("./AbstractManager");

class MessageManager extends AbstractManager {
  constructor() {
    super({ table: "messages" });
  }

  async findByConversation(conversationId) {
    const [rows] = await this.database.query(
      `SELECT id, conversation_id, sender_id, content, sent_at
       FROM ${this.table}
       WHERE conversation_id = ?
       ORDER BY sent_at, id`,
      [conversationId]
    );
    return rows;
  }

  async insert({ conversation_id: conversationId, sender_id: senderId, content }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
      [conversationId, senderId, content]
    );
    return result.insertId;
  }
}

module.exports = MessageManager;
