function requireArgs(args, count, usageMessage) {
  if (!Array.isArray(args) || args.length < count) {
    return { ok: false, error: usageMessage };
  }
  return { ok: true };
}

function ensureEnum(value, allowedValues, errorMessage) {
  if (!allowedValues.includes(value)) {
    return { ok: false, error: errorMessage };
  }
  return { ok: true };
}

function ensurePositiveInteger(value, errorMessage) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { ok: false, error: errorMessage };
  }
  return { ok: true, value: parsed };
}

module.exports = {
  requireArgs,
  ensureEnum,
  ensurePositiveInteger
};
