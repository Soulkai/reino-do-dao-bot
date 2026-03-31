function parseCommand(rawText, prefix = '/') {
  const text = String(rawText || '').trim();
  if (!text.startsWith(prefix)) return null;

  const withoutPrefix = text.slice(prefix.length).trim();
  if (!withoutPrefix) return null;

  const parts = withoutPrefix.split(/\s+/);
  const commandName = (parts.shift() || '').toLowerCase();
  return {
    rawText: text,
    commandName,
    args: parts
  };
}

module.exports = { parseCommand };
