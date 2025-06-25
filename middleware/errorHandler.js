const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map(e => e.message)
    });
  }

  // Error de clave única
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Recurso ya existe',
      details: err.errors.map(e => e.message)
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
};

module.exports = errorHandler;
