const AbstractManager = require("./AbstractManager");

const SELECT_CATEGORY = `
  SELECT c.id, c.titre, c.description, c.category_image,
         (SELECT COUNT(*) FROM services s WHERE s.category_id = c.id AND s.status = TRUE) AS service_count
  FROM categories c`;

class CategoryManager extends AbstractManager {
  constructor() {
    super({ table: "categories" });
  }

  async find(id) {
    const [rows] = await this.database.query(`${SELECT_CATEGORY} WHERE c.id = ?`, [id]);
    return rows[0] ?? null;
  }

  async findAll() {
    const [rows] = await this.database.query(`${SELECT_CATEGORY} ORDER BY c.titre`);
    return rows;
  }

  async insert({ titre, description, category_image: image }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (titre, description, category_image) VALUES (?, ?, ?)`,
      [titre, description ?? null, image || null]
    );
    return result.insertId;
  }

  update(id, data) {
    return this.updateFields(id, data, ["titre", "description", "category_image"]);
  }
}

module.exports = CategoryManager;
