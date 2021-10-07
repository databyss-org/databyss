import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { blockToMarkdown } from '../'

let page1json
let page1md
let linkedBlocks

describe('markdown converter', () => {
  beforeAll(() => {
    page1md = fs
      .readFileSync(
        path.resolve(__dirname, '../__fixtures__/output/Page to be exported.md')
      )
      .toString()
      .split('\n')
      .filter((ln) => ln.length)
    page1json = JSON.parse(
      fs
        .readFileSync(
          path.resolve(__dirname, '../__fixtures__/exportPage1.json')
        )
        .toString()
    )
    linkedBlocks = JSON.parse(
      fs
        .readFileSync(
          path.resolve(__dirname, '../__fixtures__/linkedBlocks.json')
        )
        .toString()
    ).reduce((dict, curr) => ({ ...dict, [curr._id]: curr }), {})
  })
  it('should convert an entry block ', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[1],
    })
    const _mdExpected = page1md[0]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert a block with an external link', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[3],
    })
    const _mdExpected = page1md[2]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert a block with an internal link', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[8],
    })
    const _mdExpected = page1md[7]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert a block with an inline source', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[4],
    })
    const _mdExpected = page1md[3]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert a block with an inline topic', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[6],
    })
    const _mdExpected = page1md[5]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert an END_TOPIC block', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[7],
    })
    const _mdExpected = page1md[6]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert a TOPIC block', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[5],
    })
    const _mdExpected = page1md[4]
    assert.deepEqual(_mdActual, _mdExpected)
  })
  it('should convert a SOURCE block', () => {
    const _mdActual = blockToMarkdown({
      block: page1json.blocks[2],
      linkedBlocks,
    })
    const _mdExpected = page1md[1]
    assert.deepEqual(_mdActual, _mdExpected)
  })
})
