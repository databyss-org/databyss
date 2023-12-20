import {
  Block,
  BlockRelation,
  BlockType,
  Page,
  Text,
} from '@databyss-org/services/interfaces/'
// import { ReplicateDict, replicateDocs } from '@databyss-org/data/pouchdb/groups'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'
import { replaceInlineText } from '@databyss-org/services/text/inlineUtils'
import { nodeDbRef } from '../../databyss-desktop/src/nodeDb'

const bulkUpsert = async (upQdict: any) => {
  // compose bulk get request
  const _bulkGetQuery = { docs: Object.keys(upQdict).map((d) => ({ id: d })) }

  if (!_bulkGetQuery.docs.length) {
    return
  }

  const _res = await nodeDbRef.current!.bulkGet(_bulkGetQuery)
  // console.log('[bulkUpsert] get', _res.results)

  const _oldDocs = {}
  // build old document index
  if (_res.results?.length) {
    _res.results.forEach((oldDocRes) => {
      const _docResponse = oldDocRes.docs?.[0] as any
      if (_docResponse?.ok) {
        const _oldDoc = _docResponse.ok
        _oldDocs[_oldDoc._id] = _oldDoc
      } else {
        // new document has been created
        const _id = oldDocRes.id
        if (_id && upQdict[_id]) {
          _oldDocs[_id] = upQdict[_id]
        }
      }
    })
  }

  // compose updated documents to bulk upsert
  const _docs: any = []

  for (const _docId of Object.keys(upQdict)) {
    const { _id, doctype, ...docFields } = upQdict[_docId]
    const _oldDoc = _oldDocs[_id]
    if (_oldDoc) {
      const _doc = {
        ..._oldDoc,
        ...addTimeStamp({ ..._oldDoc, ...docFields, doctype }),
        ...(_oldDoc._rev ? { _rev: _oldDoc._rev } : {}),
        belongsToGroup: nodeDbRef.groupId,
      }
      // EDGE CASE
      /**
       * if undo on a block that went from entry -> source, validator will fail because entry will contain `name` property, in this case set `name` to null
       */
      if (_doc.type === BlockType.Entry && _doc?.name) {
        delete _doc.name
      }
      _docs.push(_doc)
    }
  }
  // console.log('[bulkUpsert] put', _docs)
  await nodeDbRef.current!.bulkDocs(_docs)
}

/**
 * Get the BlockRelations doc for this topic,
 * iterate through the pages and update blocks that have the topic as an inline entity
 */
export const updateInlines = async ({
  inlineType,
  text,
  _id,
}: {
  inlineType: InlineTypes
  text: Text
  _id: string
}) => {
  const _findRes = await nodeDbRef.current?.find({
    selector: {
      doctype: DocumentType.BlockRelation,
      blockId: _id,
    },
  })

  if (!_findRes?.docs?.length) {
    // block has no relations yet
    return
  }

  const _relation = _findRes.docs[0] as BlockRelation

  const upsertDict = {}
  // const replicateDict: ReplicateDict = {}
  // console.log('[updateInlines]', text)

  for (const _pageId of _relation!.pages) {
    let _page: Page | null
    try {
      _page = await nodeDbRef.current?.get<Page>(_pageId)
    } catch (_) {
      _page = null
    }

    if (!_page) {
      continue
    }
    for (const _blockRef of _page!.blocks) {
      if (_blockRef.type === BlockType.Entry) {
        // get the block to scan
        let _block: Block | null
        try {
          _block = await nodeDbRef.current?.get<Block>(_blockRef._id)
        } catch (_) {
          _block = null
        }

        if (!_block) {
          continue
        }

        // get all inline ranges from block
        const _inlineRanges = _block!.text.ranges.filter(
          (r) => r.marks.filter((m) => m.includes(inlineType)).length
        )

        // eslint-disable-next-line no-loop-func
        _inlineRanges.forEach((r) => {
          // if inline range is matches the ID, update block
          if (r.marks[0].length === 2) {
            const _inlineMark = r.marks[0]
            const _inlineId = _inlineMark[1]
            if (_inlineId === _id) {
              const _newText = replaceInlineText({
                text: _block!.text,
                refId: _id,
                newText: text,
                type: inlineType,
              })
              Object.assign(_block!, { text: _newText })
              // console.log('[updateInlines] block', _block)
              if (_inlineRanges.length) {
                upsertDict[_block!._id] = {
                  ..._block,
                  doctype: DocumentType.Block,
                }
              }
              // if (_block.sharedWithGroups?.length) {
              //   _block.sharedWithGroups.forEach((_groupId) => {
              //     if (!replicateDict[_groupId]) {
              //       replicateDict[_groupId] = new Set<string>()
              //       replicateDict[_groupId].add(_id)
              //     }
              //     replicateDict[_groupId].add(_block._id)
              //   })
              // }
            }
          }
        })
      }
    }
  }
  await bulkUpsert(upsertDict)
  // await replicateDocs(replicateDict)
}
