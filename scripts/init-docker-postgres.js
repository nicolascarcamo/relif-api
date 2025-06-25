const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const initDockerPostgres = async () => {
  try {
    console.log('🐳 Iniciando PostgreSQL con Docker...');
    
    // Verificar si Docker está disponible
    try {
      await execAsync('docker --version');
    } catch (error) {
      console.log('❌ Docker no está instalado o no está en el PATH');
      return false;
    }

    // Detener contenedor existente si existe
    try {
      await execAsync('docker stop automotora-postgres');
      await execAsync('docker rm automotora-postgres');
      console.log('🔄 Contenedor anterior eliminado.');
    } catch (error) {
      // El contenedor no existía, continuar
    }

    // Crear y ejecutar contenedor PostgreSQL
    const dockerCommand = `docker run -d \
      --name automotora-postgres \
      -e POSTGRES_DB=${process.env.DB_NAME || 'automotora_db'} \
      -e POSTGRES_USER=${process.env.DB_USER || 'postgres'} \
      -e POSTGRES_PASSWORD=${process.env.DB_PASSWORD || 'password'} \
      -p ${process.env.DB_PORT || 5432}:5432 \
      postgres:13`;

    await execAsync(dockerCommand);
    console.log('✅ PostgreSQL iniciado con Docker.');
    console.log('⏳ Esperando que PostgreSQL esté listo...');
    
    // Esperar un momento para que PostgreSQL inicie
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return true;
  } catch (error) {
    console.error('❌ Error al iniciar PostgreSQL con Docker:', error.message);
    return false;
  }
};

module.exports = initDockerPostgres;
