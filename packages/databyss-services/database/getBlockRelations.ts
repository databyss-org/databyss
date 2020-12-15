import { db } from './db'
import { DocumentType } from './interfaces'
// import { BlockRelation } from '../../databyss-editor/interfaces/index'

const getPouchBlockRelations = async (id: string) => {
  const _results = await db.find({
    selector: {
      documentType: DocumentType.BlockRelation,
      relatedBlock: id,
    },
  })
  const _docs = _results.docs

  console.log(_docs)
  _docs.sort((a, b) => (a.blockIndex > b.blockIndex ? 1 : -1))

  if (_docs.length) {
    let _results = {
      count: _docs.length,
      results: {},
    }

    _results = _docs.reduce((acc, curr) => {
      if (!acc.results[curr.page]) {
        // init result
        acc.results[curr.page] = [curr]
      } else {
        const _entries = acc.results[curr.page]
        _entries.push(curr)
        // sort the entries by page index value
        _entries.sort((a, b) => (a.blockIndex > b.blockIndex ? 1 : -1))

        acc.results[curr.page] = _entries
      }
      return acc
    }, _docs)
    return _results
  }
}

export default getPouchBlockRelations
