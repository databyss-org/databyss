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
  $type: string
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
  $type,
  _id,
  doc,
}: {
  $type: DocumentType
  _id: string
  doc: any
}) => {
  upQdict.current.push({ ...doc, _id, $type })
}

export const findAll = async ({
  $type,
  query,
  useIndex,
}: {
  $type: DocumentType
  query?: any
  useIndex?: string
}) => {
  let _useIndex
  const _designDocResponse = await dbRef.current!.find({
    selector: {
      _id: `_design/${useIndex}`,
    },
  })

  if (_designDocResponse.docs.length) {
    _useIndex = useIndex
  }

  const _response = await dbRef.current!.find({
    selector: {
      $type,
      ...query,
    },
    use_index: _useIndex,
  })
  if (_response?.warning) {
    console.log('ERROR', _response)
    console.log($type, query)
  }

  return _response.docs
}

export const findOne = async <T extends Document>({
  $type,
  query,
  useIndex,
}: {
  $type: DocumentType
  query: any
  useIndex?: string
}): Promise<T | null> => {
  let _useIndex
  const _designDocResponse = await dbRef.current!.find({
    selector: {
      _id: `_design/${useIndex}`,
    },
  })

  if (_designDocResponse.docs.length) {
    _useIndex = useIndex
  }

  const _response = await dbRef.current!.find({
    selector: {
      $type,
      ...query,
    },
    use_index: _useIndex,
  })

  if (_response?.warning) {
    console.log('ERROR', _response)
    console.log($type, query)
  }

  if (_response.docs.length) {
    return _response.docs[0]
  }
  return null
}

/**
 * Gets a document by id
 * @returns Promise, resolves to document or null if not found
 */
export const getDocument = async <T extends Document>(
  id: string
): Promise<T | null> => {
  try {
    return await dbRef.current?.get(id)
  } catch (err) {
    if (err.name === 'not_found') {
      return null
    }
    throw err
  }
}

export const replaceOne = async ({
  $type,
  query,
  doc,
}: {
  $type: DocumentType
  query: any
  doc: any
}) => {
  const res = await findOne({ $type, query })
  // if document doesnt exit, create a new one
  const _id = res?._id || uid()
  // replace document
  await upsert({ $type, _id, doc })
}

/*
_local documents do not appear with `find` so a `get` function must be used
*/
export const getUserSession = async (): Promise<UserPreference | null> => {
  let response
  try {
    response = await dbRef.current!?.get('user_preference')
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

  const _res = await dbRef.current!.search({
    query,
    fields: ['text.textValue'],
    include_docs: true,
    filter: (doc) =>
      doc.type === BlockType.Entry && doc.$type === DocumentType.Block,
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
export const upsertImmediate = ({
  $type,
  _id,
  doc,
}: {
  $type: DocumentType
  _id: string
  doc: any
}) => {
  dbRef.current!.upsert(_id, (oldDoc) => {
    const _doc = {
      ...oldDoc,
      ...addTimeStamp({ ...oldDoc, ...doc, $type }),
      belongsToGroup: getAccountFromLocation(),
    }
    pouchDataValidation(_doc)
    return _doc
  })
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
    if (!this.isProcessing) {
      while (upQdict.current.length) {
        // do a coallece
        this.isProcessing = true
        const _upQdict = coallesceQ(upQdict.current)
        upQdict.current = []
        for (const _docId of Object.keys(_upQdict)) {
          const { _id, $type } = _upQdict[_docId]
          upsertImmediate({ _id, $type, doc: _upQdict[_docId] })
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
