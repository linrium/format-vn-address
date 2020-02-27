const format = require('./format')
const { isVenue, isAddress, extractAddress } = require('./extract')

module.exports = {
  format,
  isVenue,
  isAddress,
  extract: extractAddress
}
