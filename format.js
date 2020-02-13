const _ = require('lodash/fp')
const { match, when } = require('./utils/match-when')
const regex = require('./data/regex')
const escapeStringRegexp = require('escape-string-regexp')
const dictionary = require('./data/dictionary')

const log = label => str => {
  console.log(label, str)

  return str
}

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

const dedupSpaces = _.replace(/\s+/g, ' ')

const trimAll = _.flow([_.split(','), _.map(_.trim), _.join(', ')])

const splitAll = _.split(',')

const capitalizeAll = _.map(
  _.flow([_.split(' '), _.map(_.flow([_.toLower, _.upperFirst])), _.join(' ')]),
)

const dedupString = _.flow([
  _.uniqBy(_.flow([_.lowerCase, removeAccents])),
  _.join(', '),
])

const cleanCity = _.flow([
  _.replace(/Tp[,.]?/i, ''),
  _.replace(/\b(Tx\.|Tx)\b/i, 'Thị xã '),
  _.replace(/\b(Tt\.|Tt)\b/i, 'Thị trấn '),
])

const sanitizeStreet = _.flow([
  _.replace(/(Street)|(Road)/i, ','),
  _.replace(/(Đường)((?:(?!Đường ).)*?((?=,)))/i, '$1 $2'),
])

const cleanAddress = _.flow([
  _.replace(/\.,/g, ','),
  _.replace(
    /^(số|so|ngo|ngõ|hẻm|hem|số nhà|sn|Sô Nha|Sô|Đến)\s?([0-9]+)/i,
    '$2',
  ),
  _.replace(
    /^([a-z0-9]*)(\s?-\s?)([a-z0-9]*)(,?\s)([a-z0-9]*)(\s?-\s?)([a-z0-9]*)/i,
    '$1@$3$4$5@$7',
  ),
  // _.replace(/^([a-z0-9]*)(\s?-\s?)([a-z0-9]*)/i, '$1@$3'),
  _.replace(/^([0-9a-z]+)(\s?-\s?)((?:.)*?)(?=,)/gi, (_, p1, p2, p3) => {
    if (p3.length > 3) {
      return p1 + ' @ ' + p3
    }

    return p1 + '@' + p3
  }),
  _.replace(/([0-9]+)(-)([0-9]+)(-)([0-9]+)/, '$1@$3@$5'),
  _.replace(/([0-9]+)(-)([0-9]+)/, '$1@$3'),
  _.replace(/\s?-\s?/g, ', '),
  _.replace(/(\d)-/g, '$1,'),
  _.replace(/; /g, ' '),
  _.replace(/@/g, '-'),
  _.replace(/(ngách|ngach)(\d+)/gi, '$1 $2'),
  _.replace(/^[,.]*\s?/, ''),
])

const addLeadingZero = _.flow([
  _.replace(/(Quận|Phường)(\s+)(\d+)/gi, (_, p1, p2, p3) => {
    return p1 + p2 + p3.trim().padStart(2, '0')
  }),
])

const sanitizeCounty = _.flow([
  _.replace(/(District((?:(?!District).)*?(\s{2}|(?=,))))/gi, (_, p1, p2) => {
    if (p2 && !isNaN(p2)) {
      return 'Quận ' + p2
    }

    return p2
  }),
  _.replace(/District/i, ''),
  _.replace(/(,?\s?)((\bQuan\b)|(Q\s|Q\.))/gi, ', Quận '),
  _.replace(/\s(q|-q)(\d{1,2})/gi, ' Quận $2'),
  _.replace(/(q)(?=[^ul\s.,0-9])/gi, 'Quận '),
  _.replace(/(,?\s?)((Huyen\b)|(\bH\.))/gi, ', Huyện '),
])

const sanitizeLocality = _.flow([
  _.replace(/Phường,/gi, '#'),
  _.replace(/Phường/gi, ', Phường '),
  _.replace(/(,\s?)((Phuong)|(P\s|P\.|F\s|F\.|Ward))/gi, ', Phường '),
  _.replace(/\s([pf])(\d{1,2})\b/gi, ', Phường $2'),
  _.replace(/(p)(?=[^hlua\s.,0-9])/gi, 'Phường '),
  _.replace(/\b(x\.)\b/gi, 'Xã '),
  _.replace(/(\s)(Ấp)/i, ' Ấp '),
  _.replace(/#/g, 'Phường,')
])

const createMatchFactory = source => ({
  pattern = '',
  flags = 'i',
  matchFlags,
  replacement,
  matchCallback,
} = {}) => {
  const matcher = Object.keys(source).reduce((acc, key) => {
    const flag = matchFlags ? matchFlags : flags
    const re = new RegExp(source[key] + pattern, flag)
    acc[when(re)] = matchCallback
      ? matchCallback(re, key)
      : _.replace(re, !!replacement ? replacement(key) : key)

    return acc
  }, {})

  matcher[when()] = value => value

  return matcher
}

const cleanCityNameFactory = createMatchFactory(regex)

const fixAccent = match(
  cleanCityNameFactory({
    flags: 'i',
  }),
)

const cleanSuffix = match({
  [when(/Vietnam|Việt Nam/i)]: _.replace(/Vietnam|Việt Nam.*/i, ''),
  [when()]: match(
    cleanCityNameFactory({
      pattern: '.*',
      flags: 'i',
      replacement: key => ', ' + key + ', Việt Nam',
    }),
  ),
})

const cleanWildcard = _.flow([
  _.replace(/^([0-9/]+)(,?)(\s-)?/, '$1'), // xoa dau , ke so
  _.replace(/(\s-\s|,\s,)/g, ', '), // xoa dau -
  _.replace(/^.*:/g, ''), // xoa cac ky tu la dau chuoi - vd: Người nhận : khả kỳ Sdt: 0792042968 Địa chỉ: Duong ABC,
])

const reverseString = _.flow([_.split(','), _.reverse, _.join(',')])

const revertStreetAbbr = match(createMatchFactory(dictionary)())

const dedupStringFactory = patternString => (value, index) => {
  const reLocality = /(Phường((?:(?!Phường).)*?))|(Thị trấn((?:(?!Thị trấn).)*?))/gi
  const reWard = /(Quận((?:(?!Quận).)*?))|(Huyện((?:(?!Huyện).)*?))|(Thị xã((?:(?!Thị xã).)*?))/gi

  if (!isNaN(patternString)) {
    return value
  }

  if (!reLocality.test(value) && !reWard.test(value)) {
    const patternStringNoAccent = removeAccents(patternString)
    const re = new RegExp(
      `^(?!.*(\\d ${patternString}|Đường\\s+${patternString}|Thị xã ${patternString}|\\d ${patternStringNoAccent}|Kho ${patternString}|Kho ${patternStringNoAccent}|Tuyến ${patternString}|Tuyen ${patternStringNoAccent}|Thị xã ${patternStringNoAccent}|Đường\\s+${patternStringNoAccent})).*$`,
      'gi',
    )

    if (re.test(value)) {
      value = value.replace(
        new RegExp(`\\b${patternString}|\\b${patternStringNoAccent}`, 'gi'),
        '',
      )
    }
  }

  return value
}

const dedupAdmin = (str, patternString, hasWardOrLocality = false) => {
  const arr = str.split(',')
  const callback = dedupStringFactory(patternString)

  if (hasWardOrLocality) {
    return arr.map(callback).join(',')
  }

  arr[0] = callback(arr[0])

  return arr.join(',')
}

const dedupCity = (retry = 10) => (str, currentRetry = 0) => {
  if (currentRetry === retry) {
    return str
  }

  const matcher = match(
    str,
    cleanCityNameFactory({
      matchFlags: 'gi',
      matchCallback: re => value => value.match(re),
    }),
  )

  if (!Array.isArray(matcher)) {
    return str
  }

  if (matcher && matcher.length >= 2) {
    const result = match(
      str,
      cleanCityNameFactory({
        replacement: () => '',
      }),
    )

    return dedupCity(retry)(result, currentRetry + 1)
  }

  return str
}

const dedupCounty = (retry = 10) => (str, currentRetry = 0) => {
  const arr = str.split(',')

  if (arr.length === 1) {
    return str
  }

  if (currentRetry === retry) {
    return str
  }

  const matcher = str.match(
    /(Quận((?:(?!Quận).)*?(\s{2}|(?=,)))|Thị Xã((?:(?!Thị Xã).)*?(\s{2}|(?=,)))|Huyện((?:(?!Huyện).)*?(\s{2}|(?=,)|(?=Hồ)|(?=Hà))))/gi,
  )
  const fullWardName = RegExp.$1
  const rawWardName = RegExp.$2 ? RegExp.$2 : RegExp.$4
  const wardName = escapeStringRegexp(rawWardName.replace(/(^\s+|,$)/gi, ''))

  const re = `${escapeStringRegexp(fullWardName)}`
  const matcher1 = str.match(new RegExp(re, 'gi'))

  if (!Array.isArray(matcher1)) {
    return str
  }

  if (matcher1 && matcher1.length >= 2) {
    const result = str.replace(new RegExp(re, 'i'), '')

    return dedupCounty(retry)(result, currentRetry + 1)
  }

  const hasWardOrLocality = matcher && matcher.length > 0

  return dedupAdmin(str, wardName, hasWardOrLocality)
}

const dedupLocality = (retry = 10) => (str, currentRetry = 0) => {
  const arr = str.split(',')

  if (arr.length === 1) {
    return str
  }

  if (currentRetry === retry) {
    return str
  }

  const matcher = str.match(
    /(Phường((?:(?!Phường).)*?(\s{2}|(?=,)|Quận((?:(?!Phường).)*?),)))/gi,
  )
  const fullLocalityName = escapeStringRegexp(RegExp.$1)
  const localityName = escapeStringRegexp(RegExp.$2.replace(/(^\s+|,$)/gi, ''))

  const re = `${fullLocalityName}`
  const matcher1 = str.match(new RegExp(re, 'gi'))

  if (!Array.isArray(matcher1)) {
    return str
  }

  if (matcher1 && matcher1.length >= 2) {
    const result = str.replace(new RegExp(re, 'i'), '')

    return dedupLocality(retry)(result, currentRetry + 1)
  }

  const hasWardOrLocality = matcher && matcher.length > 0

  return dedupAdmin(str, localityName, hasWardOrLocality)
}

const cleanPostalCode = _.replace(/,\s+\d+,/gi, ',')

const format = _.flow([
  _.replace(/Phuong(?:(?!Phuong).)*?Việt Nam,/gi, ''),
  _.replace(/Vietnam|Việt Nam|Viet Nam|VN|ViệtNam/gi, ''),
  _.replace(/Đường/gi, ' Đường '),
  _.replace(/Đc|Dc|, Hem|Địa Chị|Địa Chỉ/gi, ''),
  revertStreetAbbr,
  sanitizeCounty,
  sanitizeLocality,
  addLeadingZero,
  cleanAddress,
  dedupSpaces,
  reverseString,
  cleanCity,
  sanitizeStreet,
  fixAccent,
  trimAll,
  splitAll,
  capitalizeAll,
  dedupString,
  reverseString,
  dedupCity(),
  cleanPostalCode,
  trimAll,
  cleanWildcard,
  cleanSuffix,
  trimAll,
  dedupLocality(),
  dedupCounty(),
  _.replace(/([a-z])(\s+)(Quận|Huyện)/gi, '$1, $3 '),
  dedupSpaces,
  _.replace(/(phố)/, ' Phố'), // them khoang cach
  _.replace(/(Ngõ|số)(\d+)/i, '$1 $2'), // them khoang cach
  _.replace(
    /(QUA GỌI|qua goi|Gọi|Goi|Láy|Lấy|Lay|Giao Trước|Giao truoc|Nghỉ|Có)((?:.)*?(\s{2}|(?=,)))/i,
    '',
  ),
  _.replace(/(Gần((?:.)*?(\s{2}|(?=,))))/i, ', $1'),
  _.replace(/(09|08|01[2689])+([0-9]{8})\b/, ''),
  _.replace(/,\s,\s,|,\s,/g, ','),
  _.replace(/\/,/g, ','),
  _.replace(/\/\s/g, ' '), // xoa dau /
  trimAll,
])

module.exports = format
