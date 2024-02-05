import { BlockType, Document } from '@databyss-org/services/interfaces'
import { pouchDataValidation } from './db'
import { dbRef } from './dbRef'
import { addTimeStamp } from './docUtils'
import { DocumentType } from './interfaces'

// todo: use document type interface
export const bulkUpsert = async (upQdict: any) => {
  // compose bulk get request
  const _bulkGetQuery = { docs: Object.keys(upQdict).map((d) => ({ id: d })) }

  if (!_bulkGetQuery.docs.length) {
    return
  }

  const _res = await dbRef.current!.bulkGet(_bulkGetQuery)
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
      const { sharedWithGroups } = _oldDoc

      const _groupSet = new Set(
        (_oldDoc?.sharedWithGroups ?? []).concat(sharedWithGroups ?? [])
      )
      const _doc = {
        ..._oldDoc,
        ...addTimeStamp({ ..._oldDoc, ...docFields, doctype }),
        ...(_oldDoc._rev ? { _rev: _oldDoc._rev } : {}),
        // except for pages, sharedWithGroups is always additive here (we remove in _bulk_docs)
        sharedWithGroups:
          doctype === DocumentType.Page
            ? sharedWithGroups ?? _oldDoc?.sharedWithGroups
            : Array.from(_groupSet),
        belongsToGroup: dbRef.groupId,
      }
      // EDGE CASE
      /**
       * if undo on a block that went from entry -> source, validator will fail because entry will contain `name` property, in this case set `name` to null
       */
      if (_doc.type === BlockType.Entry && _doc?.name) {
        delete _doc.name
      }

      pouchDataValidation(_doc)

      _docs.push(_doc)
    }
  }
  // console.log('[bulkUpsert] put', _docs)
  await dbRef.current!.bulkDocs(_docs)
}

export const findAll = async ({
  doctype,
  query,
  useIndex,
}: {
  doctype: DocumentType
  query?: any
  useIndex?: string
}) => {
  let _useIndex
  const _designDocResponse: any = await dbRef.current!.find({
    selector: {
      _id: `_design/${useIndex}`,
    },
  })

  if (_designDocResponse.docs.length) {
    _useIndex = useIndex
  }

  const _response: any = await dbRef.current!.find({
    selector: {
      doctype,
      ...query,
    },
    use_index: _useIndex,
  })

  return _response.docs
}

export const findOne = async <T extends Document>(args: {
  doctype: DocumentType
  query: any
  useIndex?: string
}): Promise<T | null> => {
  const _docs = await findAll(args)
  if (_docs.length) {
    return _docs[0]
  }
  return null
}

/**
 * Gets a document by id
 * @id id of the document
 * @returns Promise, resolves to document or null if not found
 */
export const getDocument = async <T extends Document>(
  id: string
): Promise<T | null> => {
  if (typeof id !== 'string') {
    return null
  }
  try {
    return await dbRef.current!.get(id)
  } catch (err: any) {
    if (err.name === 'not_found') {
      return null
    }
    throw err
  }
}
