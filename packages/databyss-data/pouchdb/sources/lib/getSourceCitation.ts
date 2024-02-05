import { pick } from 'lodash'
import { asyncForEach } from '@databyss-org/services/lib/util'
import { toCitation } from '@databyss-org/services/citations'
import { BlockType } from '@databyss-org/editor/interfaces'
import { SourceCitationHeader } from '@databyss-org/services/interfaces/Block'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { DocumentType } from '../../interfaces'
import { findAll } from '../../crudUtils'

export type CitationResponse = Partial<SourceCitationHeader> & {
  citation?: string
}

const getSourceCitation = async (
  styleId: string | undefined
): Promise<CitationResponse[] | ResourceNotFoundError> => {
  const _sources: SourceCitationHeader[] = await findAll({
    doctype: DocumentType.Block,
    query: {
      type: BlockType.Source,
    },
    useIndex: 'fetch-atomic',
  })

  if (!_sources.length) {
    return []
  }

  for (const _source of _sources) {
    // look up pages sources appears in using block relations

    // TODO: THIS BYPASSES THE ARCHIVE PAGE

    _source.isInPages = ['dummy-data']

    // const isInPages: string[] = []
    // // returns all pages where source id is found in element id
    // const _response = await findAll({
    //   doctype: DocumentType.Page,
    //   query: {
    //     blocks: {
    //       $elemMatch: {
    //         _id: _source._id,
    //       },
    //     },
    //   },
    //   useIndex: 'page-blocks',
    // })

    // if (_response.length) {
    //   _response.forEach((d) => {
    //     if (!d.archive) {
    //       isInPages.push(d._id)
    //     }
    //   })
    //   _source.isInPages = isInPages
    // }

    // UNCOMMENT THIS IF adding block relations to `inPages` property`
    // const _blockRelationsResponse = await db.find({
    //   selector: {
    //     doctype: DocumentType.BlockRelation,
    //     relatedBlock: _source._id,
    //   },
    // })
    // const _blockRelations: BlockRelation[] = _blockRelationsResponse.docs

    // if (_blockRelations.length) {
    //   // find if page has been archived
    //   for (const _relation of _blockRelations) {
    //     if (_relation.page) {
    //       const _page: Page = await db.get(_relation.page)
    //       if (_page && !_page?.archive) {
    //         // if page has not been archived, push to array
    //         isInPages.push(_page._id)
    //       }
    //     }
    //   }
    //   _source.isInPages = isInPages
    // }
  }
  // build responses

  const sourcesCitations: CitationResponse[] = _sources
    .filter((s) => s.isInPages?.length)
    .map((block) => {
      const sourcesCitationsDict: CitationResponse = pick(block, [
        '_id',
        'text',
        'type',
        'detail',
        'detail.authors',
        'detail.citations',
        'isInPages',
      ])
      sourcesCitationsDict.citation = ''

      return sourcesCitationsDict
    })

  // add formatted citation to each entry
  await asyncForEach(sourcesCitations, async (s) => {
    const { detail } = s
    if (detail) {
      s.citation = await toCitation(s.detail, { styleId })
    }
  })

  return sourcesCitations
}

export default getSourceCitation
