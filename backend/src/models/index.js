const mysql = require("mysql2/promise");

const UserManager = require("./UserManager");
const ServiceManager = require("./ServiceManager");
const CategoryManager = require("./CategoryManager");
const CommentManager = require("./CommentManager");
const FaqManager = require("./FaqManager");
const FriendManager = require("./FriendManager");
const ConversationManager = require("./ConversationManager");
const MessageManager = require("./MessageManager");
const ContactManager = require("./ContactManager");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  charset: "utf8mb4",
  // Les dates sont stockées et lues en UTC, quel que soit le fuseau du serveur
  timezone: "Z",
  typeCast(field, next) {
    // Les BOOLEAN MySQL (TINYINT(1)) sont renvoyés en vrais booléens
    if (field.type === "TINY" && field.length === 1) {
      const value = field.string();
      return value === null ? null : value === "1";
    }
    return next();
  },
});

pool.pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

pool
  .getConnection()
  .then((connection) => {
    console.info(`Connecté à la base de données ${DB_NAME}`);
    connection.release();
  })
  .catch((err) => {
    console.warn(
      "Impossible de se connecter à la base de données. Vérifiez votre fichier .env :",
      err.message
    );
  });

const models = {
  user: new UserManager(),
  service: new ServiceManager(),
  category: new CategoryManager(),
  comment: new CommentManager(),
  faq: new FaqManager(),
  friend: new FriendManager(),
  conversation: new ConversationManager(),
  message: new MessageManager(),
  contact: new ContactManager(),
};

Object.values(models).forEach((manager) => manager.setDatabase(pool));

module.exports = models;
