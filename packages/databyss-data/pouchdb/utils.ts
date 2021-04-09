import PouchDB from 'pouchdb'
import EventEmitter from 'es-event-emitter'
import { Document } from '@databyss-org/services/interfaces'
import { getAccountFromLocation } from '@databyss-org/services/session/_helpers'
import { DocumentType, UserPreference } from './interfaces'
import { dbRef, pouchDataValidation } from './db'
import { uid } from '../lib/uid'
import { BlockType } from '../../databyss-services/interfaces/Block'

export const addTimeStamp = (doc: any): any => {
  // if document has been created add a modifiedAt timestamp
  if (doc.createdAt) {
    return { ...doc, modifiedAt: Date.now() }
  }
  return { ...doc, createdAt: Date.now() }
}

interface Patch {
  doctype: string
  _id: string
  doc: any
}

type upsertQueueRef = {
  current: Patch[]
}

export const upQdict: upsertQueueRef = {
  current: [],
}

export const upsert = async ({
  doctype,
  _id,
  doc,
}: {
  doctype: DocumentType
  _id: string
  doc: any
}) => {
  upQdict.current.push({ ...doc, _id, doctype })
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
  try {
    return await dbRef.current!.get(id)
  } catch (err) {
    if (err.name === 'not_found') {
      return null
    }
    throw err
  }
}

/**
 * Get several documents at once
 * @param ids array of document ids to get
 * @returns dictionary of { docId => null | doc } (null if doc not found)
 */
export const getDocuments = async (
  ids: string[]
): Promise<{ [docId: string]: any | null }> => {
  const _options = { docs: ids.map((id) => ({ id })) }
  const _res = await dbRef.current?.bulkGet(_options)
  return _res!.results.reduce((accum, curr) => {
    const _doc: any = curr.docs[0]
    if (_doc.error) {
      if (_doc.error.error !== 'not_found') {
        throw new Error(`_bulk_get docId ${curr.id}: ${_doc.error.error}`)
      }
      accum[curr.id] = null
    }
    accum[curr.id] = _doc.ok
    return accum
  }, {})
}

export const replaceOne = async ({
  doctype,
  query,
  doc,
}: {
  doctype: DocumentType
  query: any
  doc: any
}) => {
  const res = await findOne({ doctype, query })
  // if document doesnt exit, create a new one
  const _id = res?._id || uid()
  // replace document
  await upsert({ doctype, _id, doc })
}

/*
_local documents do not appear with `find` so a `get` function must be used
*/
export const getUserSession = async (): Promise<UserPreference | null> => {
  let response
  try {
    console.log(dbRef.current)

    response = await dbRef.current!.get('user_preference')
  } catch (err) {
    console.error('user session not found')
  }
  return response
}

export const searchText = async (query) => {
  // calculate how strict we want the search to be

  // will require at least one word to be in the results
  const _queryLength = query.split(' ').length
  let _percentageToMatch = 1 / _queryLength
  _percentageToMatch = +_percentageToMatch.toFixed(3)
  _percentageToMatch *= 100
  _percentageToMatch = +_percentageToMatch.toFixed(0)

  const _res = await (dbRef.current as PouchDB.Database).search({
    query,
    fields: ['text.textValue'],
    include_docs: true,
    filter: (doc: any) =>
      doc.type === BlockType.Entry && doc.doctype === DocumentType.Block,
    mm: `${_percentageToMatch}%`,
  })

  return _res
}

const coallesceQ = (patches: Patch[]) => {
  const _patches = patches.reduce((dict, doc) => {
    const _id = doc._id
    dict[_id] = {
      ...(dict[_id] || {}),
      ...doc,
    }
    return dict
  }, {})

  return _patches
}

// bypasses upsert queue
export const upsertImmediate = async ({
  doctype,
  _id,
  doc,
}: {
  doctype: DocumentType
  _id: string
  doc: any
}) =>
  dbRef.current!.upsert(_id, (oldDoc) => {
    const _doc = {
      ...oldDoc,
      ...addTimeStamp({ ...oldDoc, ...doc, doctype }),
      belongsToGroup: getAccountFromLocation(),
    }
    pouchDataValidation(_doc)
    return _doc
  })

export class QueueProcessor extends EventEmitter {
  // on(event: string, listener: Function): this
  // emit(event: string): void
  interval: any
  isProcessing: boolean
  constructor() {
    super()
    this.interval = null
    this.isProcessing = false
  }

  process = async () => {
    if (!this.isProcessing) {
      while (upQdict.current.length) {
        // do a coallece
        this.isProcessing = true
        const _upQdict = coallesceQ(upQdict.current)
        upQdict.current = []
        for (const _docId of Object.keys(_upQdict)) {
          const { _id, doctype } = _upQdict[_docId]
          upsertImmediate({ _id, doctype, doc: _upQdict[_docId] })
        }
        this.isProcessing = false
      }
    }
  }

  start = () => {
    this.interval = setInterval(this.process, 3000)
  }
}

const EM = new QueueProcessor()

EM.start()
