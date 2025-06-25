const Client = require('./Client');
const Message = require('./Message');
const Debt = require('./Debt');

// Definir asociaciones
Client.hasMany(Message, { foreignKey: 'clientId', as: 'messages' });
Message.belongsTo(Client, { foreignKey: 'clientId' });

Client.hasMany(Debt, { foreignKey: 'clientId', as: 'debts' });
Debt.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = {
  Client,
  Message,
  Debt
};

