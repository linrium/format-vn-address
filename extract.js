
const extractAddressParts = arr => {
  let number = ''
  let street = ''

  arr.forEach(value => {
    const data = /^([Số|Ngõ\s0-9/\-]+)(\s)(.*)/gi.exec(value.trim())

    if (data) {
      number = data[1]
      street = data[3]
    }
  })

  return {
    number: number.trim(),
    street: street.trim(),
  }
}

const extractAddress = str => {
  const arr = str.split(',')
  let number = ''
  let street = ''
  let address = arr[0] || ''

  const data = /^([0-9A-Ha-h/\-]+)(,|\s)((?:.)*?(?=,))/g.exec(str)

  if (data) {
    number = data[1]
    street = data[3]
  } else {
    let addressParts = /Phố((?:(?!Phố).)*?(\s{2}|(?=,)))/.exec(str)

    if (addressParts) {
      street = addressParts[0]
      number = str.slice(0, addressParts.index).replace(/,/gi, '')
    } else {
      addressParts = extractAddressParts(arr)

      number = addressParts.number
      street = addressParts.street
    }
  }

  if (arr.length === 1) {
    address = arr[0] || ''
  }

  if (arr.length === 10) {
    address = _.slice(0, 6, arr).join(',')
  }

  if (arr.length === 8) {
    address = _.slice(0, 4, arr).join(',')
  }

  if (arr.length === 7) {
    address = _.slice(0, 3, arr).join(',')
  }

  if (arr.length === 6) {
    address = _.slice(0, 2, arr).join(',')
  }

  return {
    number,
    street,
    address,
    venue: address,
  }
}

module.exports = extractAddress
