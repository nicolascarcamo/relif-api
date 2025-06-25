require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/database');
const clientRoutes = require('./routes/clientRoutes');
const errorHandler = require('./middleware/errorHandler');
const seedDatabase = require('./utils/seedData');
const { waitForPostgres } = require('./utils/databaseChecker');
const initDockerPostgres = require('./scripts/init-docker-postgres');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', clientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.originalUrl 
  });
});

// Initialize and start server
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Verificar si PostgreSQL está disponible
    if (!(await waitForPostgres(10, 1000))) {
      console.log('🐳 PostgreSQL no está disponible. Intentando iniciar con Docker...');
      
      if (await initDockerPostgres()) {
        // Esperar a que Docker PostgreSQL esté listo
        if (!(await waitForPostgres(30, 1000))) {
          throw new Error('No se pudo conectar a PostgreSQL después de iniciarlo con Docker');
        }
      } else {
        throw new Error('PostgreSQL no está disponible y no se pudo iniciar con Docker');
      }
    }
    
    await connectDB();
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;