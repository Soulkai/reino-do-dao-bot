const levels = ['debug', 'info', 'warning', 'error', 'critical'];

function shouldPrint(currentLevel, wantedLevel) {
  return levels.indexOf(wantedLevel) >= levels.indexOf(currentLevel);
}

function createLogger(level = 'info') {
  function log(wantedLevel, ...args) {
    if (!shouldPrint(level, wantedLevel)) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${wantedLevel.toUpperCase()}]`, ...args);
  }

  return {
    debug: (...args) => log('debug', ...args),
    info: (...args) => log('info', ...args),
    warning: (...args) => log('warning', ...args),
    error: (...args) => log('error', ...args),
    critical: (...args) => log('critical', ...args)
  };
}

module.exports = { createLogger };
