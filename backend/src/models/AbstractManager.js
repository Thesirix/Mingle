class AbstractManager {
  constructor({ table }) {
    this.table = table;
  }

  setDatabase(database) {
    this.database = database;
  }

  async find(id) {
    const [rows] = await this.database.query(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
    return rows[0] ?? null;
  }

  async findAll() {
    const [rows] = await this.database.query(`SELECT * FROM ${this.table}`);
    return rows;
  }

  async delete(id) {
    const [result] = await this.database.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Met à jour uniquement les champs autorisés présents dans `data`.
   * Renvoie false si aucune ligne ne correspond.
   */
  async updateFields(id, data, allowedFields) {
    const entries = allowedFields
      .filter((field) => data[field] !== undefined)
      .map((field) => [field, data[field]]);

    if (entries.length === 0) {
      return (await this.find(id)) !== null;
    }

    const [result] = await this.database.query(
      `UPDATE ${this.table} SET ${entries
        .map(([field]) => `${field} = ?`)
        .join(", ")} WHERE id = ?`,
      [...entries.map(([, value]) => value), id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = AbstractManager;
