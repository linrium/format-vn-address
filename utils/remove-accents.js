const _ = require('lodash/fp')

const removeAccents = _.flow([
  _.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a'),
  _.replace(/[èéẹẻẽêềếệểễ]/g, 'e'),
  _.replace(/[ìíịỉĩ]/g, 'i'),
  _.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o'),
  _.replace(/[ùúụủũưừứựửữ]/g, 'u'),
  _.replace(/[ỳýỵỷỹ]/g, 'y'),
  _.replace(/đ/g, 'd'),
  _.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A'),
  _.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E'),
  _.replace(/[ÌÍỊỈĨ]/g, 'I'),
  _.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O'),
  _.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U'),
  _.replace(/[ỲÝỴỶỸ]/g, 'Y'),
  _.replace(/Đ/g, 'D'),
])

module.exports = removeAccents
