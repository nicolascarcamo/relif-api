const { Client, Message, Debt } = require('../models');

const seedDatabase = async () => {
  try {
    const clientCount = await Client.count();
    if (clientCount === 0) {
      console.log('🌱 Creando datos de ejemplo...');
      
      const client1 = await Client.create({
        name: 'Juan Pérez',
        rut: '11.111.111-1',
        email: 'juan.perez@email.com',
        phone: '+56912345678'
      });

      const client2 = await Client.create({
        name: 'María González',
        rut: '22.222.222-2',
        email: 'maria.gonzalez@email.com',
        phone: '+56987654321'
      });

      // Mensajes para cliente 1
      await Message.bulkCreate([
        {
          text: 'Hola, quiero comprar un auto',
          role: 'client',
          sentAt: new Date('2023-12-20T10:00:00.000Z'),
          clientId: client1.id
        },
        {
          text: 'Perfecto, te puedo ayudar con eso. ¿Qué tipo de auto buscas?',
          role: 'agent',
          sentAt: new Date('2023-12-20T10:01:00.000Z'),
          clientId: client1.id
        }
      ]);

      // Mensaje antiguo para cliente 2 (para follow-up)
      await Message.create({
        text: 'Estoy interesada en un Toyota Corolla',
        role: 'client',
        sentAt: new Date('2023-12-10T15:00:00.000Z'),
        clientId: client2.id
      });

      // Deuda para cliente 1
      await Debt.create({
        institution: 'Banco Estado',
        amount: 500000,
        dueDate: new Date('2023-11-15T00:00:00.000Z'),
        clientId: client1.id
      });

      console.log('✅ Datos de ejemplo creados correctamente.');
    }
  } catch (error) {
    console.error('❌ Error al crear datos de ejemplo:', error);
  }
};

module.exports = seedDatabase;
