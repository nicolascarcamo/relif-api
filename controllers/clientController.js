const ClientService = require('../services/clientService');
const AIService = require('../services/aiService');

class ClientController {
  constructor() {
    this.clientService = new ClientService();
    this.aiService = new AIService();
  }

  async getAllClients(req, res) {
    try {
      const clients = await this.clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener clientes',
        message: error.message 
      });
    }
  }

  async getClientById(req, res) {
    try {
      const client = await this.clientService.getClientById(req.params.id);
      res.json(client);
    } catch (error) {
      const status = error.message === 'Cliente no encontrado' ? 404 : 500;
      res.status(status).json({ 
        error: error.message 
      });
    }
  }

  async getClientsForFollowUp(req, res) {
    try {
      const clients = await this.clientService.getClientsForFollowUp();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener clientes para seguimiento',
        message: error.message 
      });
    }
  }

  async createClient(req, res) {
    try {
      const client = await this.clientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ 
        error: 'Error al crear cliente',
        message: error.message 
      });
    }
  }

  async addMessage(req, res) {
    try {
      const message = await this.clientService.addMessageToClient(
        req.params.id,
        req.body
      );
      res.status(201).json(message);
    } catch (error) {
      const status = error.message === 'Cliente no encontrado' ? 404 : 400;
      res.status(status).json({ 
        error: error.message 
      });
    }
  }

  async generateMessage(req, res) {
    try {
      const client = await this.clientService.getClientById(req.params.id);
      const generatedText = await this.aiService.generateMessage(client);

      // Crear el mensaje en la base de datos
      const message = await this.clientService.addMessageToClient(
        req.params.id,
        {
          text: generatedText,
          role: 'agent',
          sentAt: new Date()
        }
      );

      res.json({
        text: message.text,
      });
    } catch (error) {
      const status = error.message === 'Cliente no encontrado' ? 404 : 500;
      res.status(status).json({ 
        error: error.message 
      });
    }
  }
}

module.exports = ClientController;
