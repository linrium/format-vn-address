const format = require('../format')
const cases = require('./addresses')

describe('test format function', function() {
  it.each(cases)(
    'test %p',
    (rawAddress, expectedResult) => {
      const result = format(rawAddress)
      expect(result).toBe(expectedResult)
    }
  )
})
