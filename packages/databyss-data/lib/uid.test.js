import Hashids from 'hashids'
import { nanoid } from 'nanoid'
import { uid } from './uid'

test('uid() should return a unique id on every call', () => {
  const id1 = uid()
  const id2 = uid()
  expect(id1).not.toEqual(id2)
})

test('uid() should randomize based on hash', () => {
  const hashids1 = new Hashids(nanoid())
  const hashids2 = new Hashids(nanoid())

  const id1 = uid(hashids1, { count: 0 })
  const id2 = uid(hashids2, { count: 0 })
 
  expect(id1).not.toEqual(id2)
})
