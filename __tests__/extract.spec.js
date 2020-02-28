const extract = require('../extract')
const cases = require('./extract.mock')

describe('test format function', function() {
  it.each(cases)(
    'test %p',
    (rawAddress, expectedResult) => {
      const result = extract(rawAddress)
      expect(result).toMatchObject(expectedResult)
    }
  )
})
