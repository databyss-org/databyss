import * as PouchDB from 'pouchdb-browser'
import { BlockRelation } from '@databyss-org/editor/interfaces/index'
import { db } from '../../db'
import {
  DocumentType,
  BlockRelationsServerResponse,
} from '../../../interfaces/Block'

const getBlockRelations = async (
  id: string
): Promise<BlockRelationsServerResponse | null> => {
  const _results: PouchDB.Find.FindResponse<BlockRelation> = await db.find({
    selector: {
      documentType: DocumentType.BlockRelation,
      relatedBlock: id,
    },
  })
  const _docs: BlockRelation[] = _results.docs

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
    }, _results)
    return _results
  }
  return null
}

export default getBlockRelations
