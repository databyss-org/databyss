import { uid } from './uid'

test('uid() should return a unique id on every call', () => {
  const ids = []
  let _id
  for (let i = 0; i < 1000; i += 1) {
    _id = uid()
    expect(ids).not.toContain(_id)
    ids.push(_id)
  }
})

test('uid() should return a 12-character id', () => {
  const id1 = uid()
  expect(id1.length).toBe(12)
})
