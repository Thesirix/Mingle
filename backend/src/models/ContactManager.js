const AbstractManager = require("./AbstractManager");

class ContactManager extends AbstractManager {
  constructor() {
    super({ table: "contact_messages" });
  }

  async insert({ email, subject, message }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (email, subject, message) VALUES (?, ?, ?)`,
      [email, subject, message]
    );
    return result.insertId;
  }
}

module.exports = ContactManager;
