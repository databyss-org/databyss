import { uid } from './uid'

test('uid() should return a unique id on every call', () => {
  const ids = {}
  let _id
  for (let i = 0; i < 100000; i += 1) {
    _id = uid()
    expect(ids[_id]).toBeUndefined()
    ids[_id] = 1
  }
})

test('uid() should return a 12-character id', () => {
  expect(uid().length).toBe(12)
})
