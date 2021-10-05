import assert from 'assert'
import { exportPage } from '../exportPage.ts'
import page1json from '../__fixtures__/exportPage1.json'

describe('export single page', () => {
  it('should export to markdown', () => {
    const _md = exportPage(page1json)
    assert.deepEqual(_md, page1md)
  })
})
