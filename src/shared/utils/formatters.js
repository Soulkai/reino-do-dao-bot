function formatSection(title, summary, bullets = [], nextCommands = []) {
  const bulletText = bullets.length ? `\n${bullets.map((item) => `• ${item}`).join('\n')}` : '';
  const nextText = nextCommands.length ? `\n\nPróximos comandos: ${nextCommands.join(' ')}` : '';
  return `[${title}]\n${summary}${bulletText}${nextText}`;
}

function formatCurrencyLabel(currency) {
  const labels = {
    gold: 'Ouro',
    spirit_stones: 'Pedras Espirituais',
    celestial_crystals: 'Cristais Celestiais',
    merit: 'Mérito',
    destiny_points: 'Pontos do Destino'
  };
  return labels[currency] || currency;
}

module.exports = {
  formatSection,
  formatCurrencyLabel
};
