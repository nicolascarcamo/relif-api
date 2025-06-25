require('dotenv').config();
const { connectDB } = require('../config/database');

const setupDatabase = async () => {
  console.log('🚀 Iniciando configuración de base de datos...');
  try {
    await connectDB();
    console.log('✅ Base de datos configurada correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  }
};

setupDatabase();

