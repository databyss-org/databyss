import { getAccountFromLocation } from './utils'

describe('getAccountFromLocation', () => {
  it('should return false for root url', () => {
    expect(getAccountFromLocation('/')).toBe(false)
  })
  it('should return false for url that has no account id', () => {
    expect(getAccountFromLocation('/signup')).toBe(false)
  })
  it('should return id for url that has account id with g_', () => {
    expect(getAccountFromLocation('/g_jfw83wjljf89sq')).toEqual(
      'g_jfw83wjljf89sq'
    )
  })
  it('should return id for url that has account id with p_', () => {
    expect(getAccountFromLocation('/p_uafefn832h10aa')).toEqual(
      'p_uafefn832h10aa'
    )
  })
})
