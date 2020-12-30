import { pick } from 'lodash'
import { asyncForEach } from '@databyss-org/services/lib/util'
import { toCitation } from '@databyss-org/services/citations'
import {
  // BlockRelation,
  DocumentType,
  BlockType,
} from '@databyss-org/editor/interfaces'
import { db } from '../../db'
import { SourceCitationHeader } from '../../../interfaces/Block'

// import { Page } from '../../interfaces/Page'
import { ResourceNotFoundError } from '../../../interfaces/Errors'
import { asyncErrorHandler } from '../../util'

export type CitationResponse = Partial<SourceCitationHeader> & {
  citation?: string
}

const getSourceCitation = async (
  styleId: string | undefined
): Promise<CitationResponse[] | ResourceNotFoundError> => {
  const _response = await db.find({
    selector: {
      $type: DocumentType.Block,
      type: BlockType.Source,
    },
  })
  if (!_response.docs.length) {
    return new ResourceNotFoundError('no citation found')
  }

  const _sources: SourceCitationHeader[] = _response.docs
  for (const _source of _sources) {
    // look up pages sources appears in using block relations

    const isInPages: string[] = []
    // returns all pages where source id is found in element id
    const __response = await db.find({
      selector: {
        $type: DocumentType.Page,
        blocks: {
          $elemMatch: {
            _id: _source._id,
          },
        },
      },
    })
    if (__response.docs.length) {
      __response.docs.forEach((d) => {
        if (!d.archive) {
          isInPages.push(d._id)
        }
      })
      _source.isInPages = isInPages
    }

    // UNCOMMENT THIS IF adding block relations to `inPages` property`
    // const _blockRelationsResponse = await db.find({
    //   selector: {
    //     $type: DocumentType.BlockRelation,
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

export default asyncErrorHandler(getSourceCitation)
