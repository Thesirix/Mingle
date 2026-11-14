const AbstractManager = require("./AbstractManager");

const SELECT_SERVICE = `
  SELECT s.id, s.titre, s.description, s.illustration, s.status, s.created_at,
         s.user_id, u.username, u.avatar, u.localisation,
         s.category_id, c.titre AS category_titre,
         (SELECT COUNT(*) FROM comments cm WHERE cm.service_id = s.id) AS comment_count
  FROM services s
  JOIN users u ON u.id = s.user_id
  LEFT JOIN categories c ON c.id = s.category_id`;

class ServiceManager extends AbstractManager {
  constructor() {
    super({ table: "services" });
  }

  async find(id) {
    const [rows] = await this.database.query(`${SELECT_SERVICE} WHERE s.id = ?`, [id]);
    return rows[0] ?? null;
  }

  /**
   * @param {object} filters
   * @param {number} [filters.userId] services d'un utilisateur
   * @param {number} [filters.categoryId] services d'une catégorie
   * @param {string} [filters.search] recherche plein texte simple
   * @param {boolean} [filters.includeInactive] inclut les services désactivés
   */
  async findAll({ userId, categoryId, search, includeInactive = false } = {}) {
    const conditions = [];
    const values = [];

    if (!includeInactive) conditions.push("s.status = TRUE");
    if (userId) {
      conditions.push("s.user_id = ?");
      values.push(userId);
    }
    if (categoryId) {
      conditions.push("s.category_id = ?");
      values.push(categoryId);
    }
    if (search) {
      conditions.push("(s.titre LIKE ? OR s.description LIKE ? OR c.titre LIKE ?)");
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await this.database.query(
      `${SELECT_SERVICE} ${where} ORDER BY s.created_at DESC`,
      values
    );
    return rows;
  }

  async insert({ titre, description, illustration, user_id: userId, category_id: categoryId }) {
    const [result] = await this.database.query(
      `INSERT INTO ${this.table} (titre, description, illustration, user_id, category_id) VALUES (?, ?, ?, ?, ?)`,
      [titre, description, illustration ?? null, userId, categoryId]
    );
    return result.insertId;
  }

  update(id, data) {
    return this.updateFields(id, data, [
      "titre",
      "description",
      "illustration",
      "status",
      "category_id",
    ]);
  }
}

module.exports = ServiceManager;
