const { Client, Message, Debt } = require('../models');
const { sequelize } = require('../config/database');

class ClientService {
  async getAllClients() {
    return await Client.findAll({
      attributes: ['id', 'name', 'rut']
    });
  }

  async getClientById(id) {
    const client = await Client.findByPk(id, {
      include: [
        {
          model: Message,
          as: 'messages',
          attributes: ['id', 'text', 'sentAt', 'role']
        },
        {
          model: Debt,
          as: 'debts',
          attributes: ['id', 'amount', 'institution', 'dueDate']
        }
      ]
    });

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    return client;
  }

  async getClientsForFollowUp() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clients = await Client.findAll({
      include: [
        {
          model: Message,
          as: 'messages',
          attributes: ['sentAt'],
          limit: 1,
          order: [['sentAt', 'DESC']]
        }
      ],
      attributes: ['id', 'name', 'rut']
    });

    return clients
      .filter(client => {
        if (!client.messages || client.messages.length === 0) {
          return false;
        }
        const lastMessage = client.messages[0];
        return new Date(lastMessage.sentAt) < sevenDaysAgo;
      })
      .map(client => ({
        id: client.id,
        name: client.name,
        rut: client.rut
      }));
  }

  async createClient(clientData) {
    const transaction = await sequelize.transaction();
    
    try {
      const { name, rut, email, phone, messages, debts } = clientData;

      // Crear cliente
      const client = await Client.create({
        name, rut, email, phone
      }, { transaction });

      // Crear mensajes si existen
      if (messages && messages.length > 0) {
        const messagePromises = messages.map(message => 
          Message.create({
            ...message,
            clientId: client.id
          }, { transaction })
        );
        await Promise.all(messagePromises);
      }

      // Crear deudas si existen
      if (debts && debts.length > 0) {
        const debtPromises = debts.map(debt => 
          Debt.create({
            ...debt,
            clientId: client.id
          }, { transaction })
        );
        await Promise.all(debtPromises);
      }

      await transaction.commit();

      // Retornar cliente completo
      return await this.getClientById(client.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async addMessageToClient(clientId, messageData) {
    // Verificar que el cliente existe
    await this.getClientById(clientId);

    const { text, role, sentAt } = messageData;
    return await Message.create({
      text,
      role,
      sentAt: sentAt || new Date(),
      clientId
    });
  }
}

module.exports = ClientService;
