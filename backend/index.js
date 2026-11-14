require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET est manquant. Copiez .env.sample vers .env et renseignez-le.");
  process.exit(1);
}

const app = require("./src/app");

const port = parseInt(process.env.APP_PORT ?? "5000", 10);

app.listen(port, () => {
  console.info(`API Mingle à l'écoute sur http://localhost:${port}`);
});
