import PouchDB from 'pouchdb'
import { throttle } from 'lodash'
import EventEmitter from 'es-event-emitter'
import { Document, Group } from '@databyss-org/services/interfaces'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import { DocumentType, UserPreference } from './interfaces'
import { dbRef, pouchDataValidation } from './db'
import { uid } from '../lib/uid'
import { BlockType } from '../../databyss-services/interfaces/Block'
import { getGroupActionQ } from './groups/utils'
import { CouchDb } from '../couchdb/couchdb'

const INTERVAL_TIME = 1000

export const upQdict: upsertQueueRef = {
  current: [],
}

let _isBusy = false
let _writesPending = 0

export const setDbBusy = (isBusy: boolean, writesPending?: number) => {
  _writesPending =
    writesPending ??
    upQdict.current.length + Object.keys(getGroupActionQ()).length
  // only set busy to false if no writes are left in queue
  _isBusy = !!(_writesPending || writesPending) || isBusy
}

export interface DbStatus {
  isBusy: boolean
  writesPending: number
}
export const getDbBusy = (): DbStatus => ({
  isBusy: _isBusy,
  writesPending: _writesPending,
})

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
  setDbBusy(!!upQdict.current.length)
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
  } catch (err: any) {
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
export const getDocuments = async <D>(
  ids: string[]
): Promise<{ [docId: string]: D | null }> => {
  if (!ids.length) {
    return {}
  }
  const _options = { docs: ids.map((id) => ({ id })) }
  const _res = await dbRef.current?.bulkGet(_options)
  return _res!.results.reduce((accum, curr) => {
    const _doc: any = curr.docs[0]
    if (_doc.error) {
      console.warn('[getDocuments] error', _doc.error)
      if (_doc.error.name !== 'not_found' && _doc.error.error !== 'not_found') {
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

export const getUserSession = async (): Promise<UserPreference | null> => {
  let response
  try {
    response = await dbRef.current!.get('user_preference')
  } catch (err) {
    // noop
  }
  return response
}

export const getGroupSession = async (
  maxRetries: number = 0
): Promise<Group | null> =>
  new Promise((resolve) => {
    if (!dbRef.current) {
      resolve(null)
      return
    }

    const _getGroup = async (count = 0) => {
      if (count > maxRetries) {
        resolve(null)
        return
      }

      const _response = await dbRef.current!.find({
        selector: {
          doctype: 'GROUP',
        },
      })
      if (!_response?.docs) {
        resolve(null)
        return
      }
      if (!_response.docs.length) {
        setTimeout(() => _getGroup(count + 1), 3000)
        return
      }
      resolve(_response.docs[0])
    }

    _getGroup()
  })

export const searchText = async ({
  query,
  onUpdated,
  allowStale,
}: {
  query: string
  onUpdated: (res: PouchDB.SearchResponse<{}>) => void
  allowStale: boolean
}) => {
  // calculate how strict we want the search to be

  // will require at least one word to be in the results
  const _queryLength = query.split(' ').length
  let _percentageToMatch = 1 / _queryLength
  _percentageToMatch = +_percentageToMatch.toFixed(3)
  _percentageToMatch *= 100
  _percentageToMatch = +_percentageToMatch.toFixed(0)

  const _params = {
    query,
    fields: ['text.textValue'],
    include_docs: true,
    filter: (doc: any) => doc.doctype === DocumentType.Block,
    mm: `${_percentageToMatch}%`,
  }

  const _res = await (dbRef.current as PouchDB.Database).search({
    ..._params,
    ...(allowStale
      ? {
          stale: 'ok',
        }
      : {}),
  })

  if (allowStale) {
    ;(dbRef.current as PouchDB.Database).search(_params).then(onUpdated)
  } else {
    onUpdated(_res)
  }

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

export const updateAccessedAt = (_id: string) =>
  dbRef.current!.upsert(_id, (oldDoc) => ({
    ...oldDoc,
    accessedAt: Date.now(),
  }))

// bypasses upsert queue
export const upsertImmediate = async ({
  doctype,
  _id,
  doc,
}: {
  doctype: DocumentType
  _id: string
  doc: any
}) => {
  const { sharedWithGroups, ...docFields } = doc
  return dbRef.current!.upsert(_id, (oldDoc) => {
    const _groupSet = new Set(
      (oldDoc?.sharedWithGroups ?? []).concat(sharedWithGroups ?? [])
    )
    const _doc = {
      ...oldDoc,
      ...addTimeStamp({ ...oldDoc, ...docFields, doctype }),
      // except for pages, sharedWithGroups is always additive here (we remove in _bulk_docs)
      sharedWithGroups:
        doctype === DocumentType.Page
          ? sharedWithGroups ?? oldDoc?.sharedWithGroups
          : Array.from(_groupSet),
      belongsToGroup: getAccountFromLocation(),
    }

    pouchDataValidation(_doc)
    return _doc
  })
}

// todo: use document type interface
const bulkUpsert = async (upQdict: any) => {
  // compose bulk get request
  const _bulkGetQuery = { docs: Object.keys(upQdict).map((d) => ({ id: d })) }

  const _res = await dbRef.current!.bulkGet(_bulkGetQuery)

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
        // except for pages, sharedWithGroups is always additive here (we remove in _bulk_docs)
        sharedWithGroups:
          doctype === DocumentType.Page
            ? sharedWithGroups ?? _oldDoc?.sharedWithGroups
            : Array.from(_groupSet),
        belongsToGroup: getAccountFromLocation(),
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
  await dbRef.current!.bulkDocs(_docs)
}

export const upsertUserPreferences = async (
  cb: PouchDB.UpsertDiffCallback<Partial<UserPreference>>
): Promise<PouchDB.UpsertResponse> =>
  dbRef.current!.upsert('user_preference', (oldDoc) => {
    const _doc = addTimeStamp({
      doctype: DocumentType.UserPreferences,
      ...cb(oldDoc),
    })
    pouchDataValidation(_doc)
    return _doc
  })

export const updateGroupPreferences = async (
  cb: PouchDB.UpsertDiffCallback<Partial<Group>>
) => {
  const _oldDoc = await getGroupSession()
  if (!_oldDoc) {
    console.warn('No group doc found')
    return
  }
  const _groupDoc = addTimeStamp({
    doctype: DocumentType.Group,
    ...cb(_oldDoc),
  })
  pouchDataValidation(_groupDoc)
  dbRef.current!.put(_groupDoc)
}

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
    if (dbRef.current instanceof CouchDb) {
      // hold items in Q if in COUCH mode
      setDbBusy(true)
      return
    }
    if (this.isProcessing) {
      // already processing, bail now
      return
    }
    if (upQdict.current.length) {
      setDbBusy(true)

      // do a coallece
      this.isProcessing = true
      const _upQdict = coallesceQ(upQdict.current)
      upQdict.current = []
      await bulkUpsert(_upQdict)
      this.isProcessing = false

      setDbBusy(false)
    } else {
      // db is not pending any writes
      setDbBusy(false)
    }
  }

  start = () => {
    this.interval = setInterval(this.process, INTERVAL_TIME)
  }
}

export const EM = new QueueProcessor()

EM.start()

// eslint-disable-next-line func-names
window.onload = function () {
  this.addEventListener(
    'mousemove',
    throttle(EM.process, 3000, { leading: true })
  )
}
