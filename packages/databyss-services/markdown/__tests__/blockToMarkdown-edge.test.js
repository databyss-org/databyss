import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { blockToMarkdown } from '../'

let page1json
let page1md

describe('markdown converter', () => {
  beforeAll(() => {
    page1md = fs
      .readFileSync(
        path.resolve(__dirname, '../__fixtures__/output/Edge case exports.md')
      )
      .toString()
      .split('\n')
      .filter((ln) => ln.length)
    page1json = JSON.parse(
      fs
        .readFileSync(
          path.resolve(__dirname, '../__fixtures__/exportPage3.json')
        )
        .toString()
    )
  })
  it('should remove all tabs ', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[2],
    })
    const _mdExpected = page1md[2]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert square to curly braces', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[3],
    })
    const _mdExpected = page1md[3]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should escape markdown chars in entries', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[4],
    })
    const _mdExpected = page1md[4]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should escape markdown chars in inline refs', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[5],
    })
    const _mdExpected = page1md[5]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should escape markdown chars in ref headers', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[6],
    })
    const _mdExpected = page1md[6]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should escape characters in the page title', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[0],
      isTitle: true,
    })
    const _mdExpected = page1md[0]
    assert.deepEqual(_mdActual, _mdExpected)
  })
})
