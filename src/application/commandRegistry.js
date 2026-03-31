const { handlers } = require('./handlers');

const registry = new Map([
  ['ajuda', handlers.ajuda],
  ['help', handlers.ajuda],
  ['registrar', handlers.registrar],
  ['perfil', handlers.perfil],
  ['status', handlers.status],
  ['inventario', handlers.inventario],
  ['cultivar', handlers.cultivar],
  ['explorar', handlers.explorar],
  ['loja', handlers.loja],
  ['comprar', handlers.comprar],
  ['mercado', handlers.defaultPlaceholder],
  ['trocar', handlers.defaultPlaceholder],
  ['duelar', handlers.defaultPlaceholder],
  ['seita', handlers.defaultPlaceholder],
  ['profissao', handlers.defaultPlaceholder],
  ['forjar', handlers.defaultPlaceholder],
  ['refinar', handlers.defaultPlaceholder]
]);

function getHandler(commandName) {
  return registry.get(commandName) || handlers.defaultPlaceholder;
}

module.exports = { getHandler };
