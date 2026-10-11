const AbstractManager = require("./AbstractManager");

class FriendManager extends AbstractManager {
  constructor() {
    super({ table: "friends" });
  }

  async findFriendsOf(userId) {
    const [rows] = await this.database.query(
      `SELECT u.id, u.username, u.localisation, u.avatar
       FROM friends f
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = ?
       ORDER BY u.username`,
      [userId]
    );
    return rows;
  }

  async add(userId, friendId) {
    await this.database.query(
      `INSERT IGNORE INTO ${this.table} (user_id, friend_id) VALUES (?, ?)`,
      [userId, friendId]
    );
  }

  async remove(userId, friendId) {
    const [result] = await this.database.query(
      `DELETE FROM ${this.table} WHERE user_id = ? AND friend_id = ?`,
      [userId, friendId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = FriendManager;
