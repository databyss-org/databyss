import EventEmmiter from 'es-event-emitter'
import { DocumentType, UserPreference } from './interfaces'
import { dbRef } from './db'
import { uid } from '../lib/uid'
import { BlockType } from '../../databyss-services/interfaces/Block'

export const addTimeStamp = (doc: any): any => {
  // if document has been created add a modifiedAt timestamp
  if (doc.createdAt) {
    return { ...doc, modifiedAt: Date.now() }
  }
  return { ...doc, createdAt: Date.now() }
}

// const EM = new EventEmmiter()

// EM.on('foo', () => {
//   console.log('some code')
// })

// EM.emit('foo')

interface Patch {
  $type: string
  _id: string
  doc: any
}

type upsertDictionary = {
  current: Patch[]
}

export const upQdict: upsertDictionary = {
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

  // dbRef.current
  //   .explain({
  //     selector: {
  //       ...query,
  //       $type,
  //     },
  //     use_index: useIndex,
  //   })
  //   .then((explained) => {
  //     console.log(explained.index.ddoc)
  //     // detailed explained info can be viewed
  //   })

  return _response.docs
}

export const findOne = async ({
  $type,
  query,
  useIndex,
}: {
  $type: DocumentType
  query: any
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

  // dbRef.current
  //   .explain({
  //     selector: {
  //       ...query,
  //       $type,
  //     },
  //     use_index: useIndex,
  //   })
  //   .then((explained) => {
  //     console.log(explained.index.ddoc)
  //     // detailed explained info can be viewed
  //   })

  if (_response.docs.length) {
    return _response.docs[0]
  }
  return null
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
    response = await dbRef.current?.get('user_preference')
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

const coallesceQ = (patches: Patch[]): Patch[] => {
  const _patches: Patch[] = patches
    .reverse()
    .reduce((acc: Patch[], curr: Patch) => {
      // if _id is already in array, skip
      if (acc.find((obj: any) => obj._id === curr._id)) {
        return acc
      }
      // add to patch array
      acc.push(curr)
      return acc
    }, [])
  return _patches
}

export class QueueProcessor extends EventEmmiter {
  on(event: string, listener: Function): this
  emit(event: string): void
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
        for (const Q of Object.values(_upQdict)) {
          const { _id } = Q
          await dbRef.current!.upsert(_id, (oldDoc) => {
            const _doc = {
              ...oldDoc,
              ...addTimeStamp({ ...oldDoc, ...Q }),
            }
            return _doc
          })
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
