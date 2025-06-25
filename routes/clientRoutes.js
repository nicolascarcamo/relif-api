const express = require('express');
const ClientController = require('../controllers/clientController');

const router = express.Router();
const clientController = new ClientController();

// Bind methods to preserve 'this' context
router.get('/clients', clientController.getAllClients.bind(clientController));
router.get('/clients/:id', clientController.getClientById.bind(clientController));
router.get('/clients-to-do-follow-up', clientController.getClientsForFollowUp.bind(clientController));
router.post('/clients', clientController.createClient.bind(clientController));
router.post('/clients/:id/message', clientController.addMessage.bind(clientController));
router.get('/clients/:id/generateMessage', clientController.generateMessage.bind(clientController));

module.exports = router;
