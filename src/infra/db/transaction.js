const { getDb } = require('./connection');

function withTransaction(callback) {
  const db = getDb();
  const tx = db.transaction((input) => callback(db, input));
  return (input) => tx(input);
}

module.exports = { withTransaction };
