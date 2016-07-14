function normalizeUUID(uuid) {
  return parseInt(uuid, 16)
}

module.exports = {
  normalizeUUID: normalizeUUID
}
