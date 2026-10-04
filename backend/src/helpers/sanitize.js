function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

module.exports = { escapeRegex, trimString };
