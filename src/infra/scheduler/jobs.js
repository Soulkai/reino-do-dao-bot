const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/connection');
const { cleanupExpiredLocks } = require('../locks/playerLock');
const { env } = require('../../config');

function ensureBackupDir() {
  const dbPath = path.resolve(env.dbPath);
  const backupDir = path.resolve(path.dirname(dbPath), 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  return backupDir;
}

function backupDatabase() {
  const dbPath = path.resolve(env.dbPath);
  if (!fs.existsSync(dbPath)) return null;

  const backupDir = ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = path.join(backupDir, `game-${timestamp}.sqlite`);
  fs.copyFileSync(dbPath, destination);
  return destination;
}

function expireMarketListings() {
  const db = getDb();
  return db.prepare(`
    UPDATE market_listings
    SET status = 'expired'
    WHERE status = 'active' AND expires_at <= CURRENT_TIMESTAMP
  `).run().changes;
}

function finalizeAuctions() {
  const db = getDb();
  return db.prepare(`
    UPDATE auction_listings
    SET status = 'finished'
    WHERE status IN ('scheduled', 'active') AND ends_at <= CURRENT_TIMESTAMP
  `).run().changes;
}

function cleanupInactiveEncounters() {
  const db = getDb();
  return db.prepare(`
    UPDATE encounters
    SET status = 'closed', ended_at = CURRENT_TIMESTAMP
    WHERE status = 'open' AND started_at <= datetime('now', '-10 minutes')
  `).run().changes;
}

function startJobs(logger) {
  const safe = (label, fn) => {
    try {
      const result = fn();
      if (result) logger.info(`[job:${label}]`, result);
    } catch (error) {
      logger.error(`[job:${label}]`, error);
    }
  };

  setInterval(() => safe('market-expire', expireMarketListings), 60_000);
  setInterval(() => safe('auction-finish', finalizeAuctions), 60_000);
  setInterval(() => safe('encounter-cleanup', cleanupInactiveEncounters), 120_000);
  setInterval(() => safe('lock-cleanup', cleanupExpiredLocks), 60_000);
  setInterval(() => safe('db-backup', backupDatabase), 30 * 60_000);
}

module.exports = {
  startJobs,
  backupDatabase,
  expireMarketListings,
  finalizeAuctions,
  cleanupInactiveEncounters
};
