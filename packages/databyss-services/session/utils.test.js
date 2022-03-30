/* eslint-disable no-global-assign */
import { getAccountFromLocation } from './utils'

describe('getAccountFromLocation', () => {
  it('should return false for root url', () => {
    window = { location: { pathname: '/' } }
    expect(getAccountFromLocation()).toBe(false)
  })
  it('should return false for url that has no account id', () => {
    window = { location: { pathname: '/signup' } }
    expect(getAccountFromLocation('/signup')).toBe(false)
  })
  it('should return id for url that has account id with g_', () => {
    window = { location: { pathname: '/g_jfw83wjljf89sq' } }
    expect(getAccountFromLocation('/g_jfw83wjljf89sq')).toEqual(
      'g_jfw83wjljf89sq'
    )
  })
  it('should return id for url that has account id with p_', () => {
    window = { location: { pathname: '/p_uafefn832h10aa' } }
    expect(getAccountFromLocation('/p_uafefn832h10aa')).toEqual(
      'p_uafefn832h10aa'
    )
  })
})
