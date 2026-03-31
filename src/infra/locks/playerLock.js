const lockMap = new Map();

function acquirePlayerLock(playerId, commandName, correlationId, ttlMs = 10000) {
  const key = String(playerId);
  const now = Date.now();
  const current = lockMap.get(key);

  if (current && now - current.acquiredAt < current.ttlMs) {
    return { ok: false, lock: current };
  }

  const lock = {
    playerId: key,
    commandName,
    correlationId,
    acquiredAt: now,
    ttlMs
  };

  lockMap.set(key, lock);
  return { ok: true, lock };
}

function releasePlayerLock(playerId, correlationId = null) {
  const key = String(playerId);
  const current = lockMap.get(key);
  if (!current) return false;
  if (correlationId && current.correlationId !== correlationId) return false;
  lockMap.delete(key);
  return true;
}

function cleanupExpiredLocks() {
  const now = Date.now();
  let removed = 0;
  for (const [key, lock] of lockMap.entries()) {
    if (now - lock.acquiredAt >= lock.ttlMs) {
      lockMap.delete(key);
      removed += 1;
    }
  }
  return removed;
}

function getActiveLocks() {
  return Array.from(lockMap.values());
}

module.exports = {
  acquirePlayerLock,
  releasePlayerLock,
  cleanupExpiredLocks,
  getActiveLocks
};
