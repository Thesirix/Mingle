const AbstractManager = require("./AbstractManager");

// Une conversation relie deux utilisateurs ; on stocke toujours le plus petit
// identifiant dans user_one_id afin de garantir l'unicité de la paire.
const orderPair = (a, b) => (a < b ? [a, b] : [b, a]);

class ConversationManager extends AbstractManager {
  constructor() {
    super({ table: "conversations" });
  }

  async findForUser(userId) {
    const [rows] = await this.database.query(
      `SELECT c.id, c.last_message, c.last_message_time, c.created_at,
              u.id AS other_id, u.username AS other_username, u.avatar AS other_avatar
       FROM conversations c
       JOIN users u ON u.id = IF(c.user_one_id = ?, c.user_two_id, c.user_one_id)
       WHERE c.user_one_id = ? OR c.user_two_id = ?
       ORDER BY COALESCE(c.last_message_time, c.created_at) DESC`,
      [userId, userId, userId]
    );
    return rows;
  }

  async findForUserById(userId, id) {
    const conversations = await this.findForUser(userId);
    return conversations.find((conversation) => conversation.id === id) ?? null;
  }

  async findBetween(userA, userB) {
    const [one, two] = orderPair(userA, userB);
    const [rows] = await this.database.query(
      `SELECT * FROM ${this.table} WHERE user_one_id = ? AND user_two_id = ?`,
      [one, two]
    );
    return rows[0] ?? null;
  }

  async insert(userA, userB) {
    const [one, two] = orderPair(userA, userB);
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (user_one_id, user_two_id) VALUES (?, ?)`,
      [one, two]
    );
    return result.insertId;
  }

  async touch(id, lastMessage) {
    await this.database.query(
      `UPDATE ${this.table} SET last_message = ?, last_message_time = NOW() WHERE id = ?`,
      [lastMessage, id]
    );
  }

  static isParticipant(conversation, userId) {
    return conversation.user_one_id === userId || conversation.user_two_id === userId;
  }
}

module.exports = ConversationManager;
