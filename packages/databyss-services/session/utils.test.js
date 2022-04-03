/* eslint-disable no-global-assign */
import { getAccountFromLocation } from './utils'

function setLocation(path) {
  delete window.location
  window.location = new URL(`http://localhost${path}`)
}

describe('getAccountFromLocation', () => {
  it('should return false for root url', () => {
    setLocation('/')
    expect(getAccountFromLocation()).toBe(false)
  })
  it('should return false for url that has no account id', () => {
    setLocation('/signup')
    expect(getAccountFromLocation()).toBe(false)
  })
  it('should return id for url that has account id with g_', () => {
    setLocation('/g_jfw83wjljf89sq')
    expect(getAccountFromLocation()).toEqual('g_jfw83wjljf89sq')
  })
  it('should return id for url that has account id with p_', () => {
    setLocation('/p_uafefn832h10aa')
    expect(getAccountFromLocation()).toEqual('p_uafefn832h10aa')
  })
})
