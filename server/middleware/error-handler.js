function notFoundHandler(req, res, next) {
  res.status(404).json({ error: "Rute tidak ditemukan." });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Terjadi kesalahan pada server." });
}

module.exports = { notFoundHandler, errorHandler };
