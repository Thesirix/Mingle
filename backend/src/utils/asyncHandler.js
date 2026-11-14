// Express 4 ne transmet pas les rejets de promesses au gestionnaire d'erreurs :
// ce wrapper s'en charge pour les contrôleurs asynchrones.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { asyncHandler, HttpError };
