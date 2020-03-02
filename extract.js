const _ = require('lodash/fp')
const removeAccents = require('./utils/remove-accents')

const hasCountry = str => {
  return /Việt Nam/gi.test(str)
}

const findCountry = str => {
  const arr = str.split(',')

  if (hasCountry(str)) {
    return arr[arr.length - 1].trim()
  }

  return ''
}

const findRegion = str => {
  const arr = str.split(',')

  if (hasCountry(str)) {
    return arr[arr.length - 2].trim()
  }

  return ''
}

const findCounty = str => {
  const arr = str.split(',')
  let county = ''
  let index = -1

  if (arr.length === 10) {
    county = arr[7]
    index = 7
  }

  if (arr.length === 9) {
    county = arr[6]
    index = 6
  }

  if (arr.length === 8) {
    county = arr[5]
    index = 5
  }

  if (arr.length === 7) {
    county = arr[4]
    index = 4
  }

  if (arr.length === 6) {
    county = arr[3]
    index = 3
  }

  if (arr.length === 5) {
    county = arr[2]
    index = 2
  }

  if (arr.length === 4) {
    county = arr[1]
    index = 1
  }

  return {
    index,
    name: county.trim()
  }
}

const findLocality = str => {
  const arr = str.split(',')
  let locality = ''
  let index = -1

  if (hasCountry(str)) {
    if (arr.length === 10) {
      locality = arr[6]
      index = 6
    }

    if (arr.length === 9) {
      locality = arr[5]
      index = 5
    }

    if (arr.length === 8) {
      locality = arr[4]
      index = 4
    }

    if (arr.length === 7) {
      locality = arr[3]
      index = 3
    }

    if (arr.length === 6) {
      locality = arr[2]
      index = 2
    }

    if (arr.length === 5) {
      locality = arr[1]
      index = 1
    }

    if (arr.length === 3) {
      locality = ''
    }

    return {
      index,
      name: locality.trim()
    }
  }

  if (arr.length >= 2) {
    return {
      index,
      name: arr[1].trim()
    }
  }

  return {
    index,
    name: locality
  }
}

const findDataByLocality = (county, locality) => {
  const reCounty = new RegExp(removeAccents(county), 'gi')
  const reLocality = new RegExp(removeAccents(locality), 'gi')
}

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
    address
  }
}

const isHouseNumber = str => {
  return /^[0-9a-h/]+/gi.test(str)
}

const isAddress = str => {
  const firstPart = str.split(',')[0];
  return firstPart.match(/^[0-9]+[a-zA-Z\-\/0-9]*[\s]+/)
}

const isVenue = str => {
  return !isAddress(str)
}

const extract = str => {
  const arr = str.split(',')
  const country = findCountry(str)
  const region = findRegion(str)
  const {name: county, index: countyIndex} = findCounty(str)
  const {name: locality, index: localityIndex} = findLocality(str)

  const index = localityIndex > -1 ? localityIndex : countyIndex

  let result = {
    country,
    region,
    county,
    locality
  }

  const addressParams = arr.slice(0, index).join(',')
  const venue = isVenue(str) ? addressParams : ''
  const {number, street, address} = extractAddress(addressParams)

  if (number) {
    result.number = number
  }

  if (street) {
    result.street = street
  }

  if (venue) {
    result.venue = venue
  } else {
    result.address = address
  }

  return result
}

module.exports = {
  extract,
  isAddress,
  isVenue
}
