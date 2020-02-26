const format = require('./format')
const { isVenue, extractAddress } = require('./extract')

module.exports = {
  format,
  isVenue,
  extract: extractAddress
}
