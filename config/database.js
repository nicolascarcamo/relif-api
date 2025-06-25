const { Sequelize } = require('sequelize');

// Función para crear la base de datos si no existe
const createDatabaseIfNotExists = async () => {
  // Conexión temporal para crear la base de datos (conecta a 'postgres' por defecto)
  const tempSequelize = new Sequelize(
    'postgres', // Base de datos por defecto que siempre existe
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await tempSequelize.authenticate();
    console.log('🔗 Conexión temporal a PostgreSQL establecida.');

    const dbName = process.env.DB_NAME || 'automotora_db';
    
    // Verificar si la base de datos existe
    const [results] = await tempSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      // Crear la base de datos si no existe
      await tempSequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente.`);
    } else {
      console.log(`✅ Base de datos '${dbName}' ya existe.`);
    }

    await tempSequelize.close();
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    await tempSequelize.close();
    throw error;
  }
};

// Configuración principal de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'automotora_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    // Primero crear la base de datos si no existe
    await createDatabaseIfNotExists();
    
    // Luego conectar a la base de datos objetivo
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
