const { Client } = require('pg');

const checkPostgresConnection = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres' // Conectar a la BD por defecto
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL está disponible.');
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL no está disponible:', error.message);
    return false;
  }
};

const waitForPostgres = async (maxRetries = 30, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    if (await checkPostgresConnection()) {
      return true;
    }
    console.log(`⏳ Esperando PostgreSQL... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};

module.exports = { checkPostgresConnection, waitForPostgres };
