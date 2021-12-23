import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { sourceToMarkdown } from '../'
import { getCitationStyle } from '../../citations/lib'

let source1md
let linkedDocs

describe('markdown converter', () => {
  beforeAll(() => {
    source1md = fs
      .readFileSync(
        path.resolve(__dirname, '../__fixtures__/output/s/Bruza 1992.md')
      )
      .toString()
    linkedDocs = JSON.parse(
      fs
        .readFileSync(
          path.resolve(__dirname, '../__fixtures__/linkedDocs.json')
        )
        .toString()
    ).reduce((dict, curr) => ({ ...dict, [curr._id]: curr }), {})
  })
  it('should convert source to markdown', async () => {
    const _mdActual = await sourceToMarkdown({
      source: linkedDocs.b9uXVnaeztqE,
      citationStyle: getCitationStyle('apa'),
    })

    const _mdExpected = source1md
    assert.deepEqual(_mdActual, _mdExpected)
  })
})
