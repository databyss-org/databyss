import { DocumentType, UserPreference } from './interfaces'
import { dbRef } from './db'
import { uid } from '../lib/uid'

export const addTimeStamp = (doc: any): any => {
  // if document has been created add a modifiedAt timestamp
  if (doc.createdAt) {
    return { ...doc, modifiedAt: Date.now() }
  }
  return { ...doc, createdAt: Date.now() }
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
  let _doc
  await dbRef.current.upsert(_id, (oldDoc) => {
    _doc = {
      ...oldDoc,
      $type,
      ...addTimeStamp({ ...oldDoc, ...doc }),
    }
    return _doc
  })
  return _doc
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
  const _response = await dbRef.current.find({
    selector: {
      $type,
      ...query,
    },
    use_index: useIndex,
  })
  if (_response?.warning) {
    console.log('ERROR', _response)
    console.log($type, query)
  }

  dbRef.current
    .explain({
      selector: {
        ...query,
        $type,
      },
      use_index: useIndex,
    })
    .then((explained) => {
      console.log(explained.index.ddoc)
      // detailed explained info can be viewed
    })

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
  const _response = await dbRef.current.find({
    selector: {
      $type,
      ...query,
    },
    use_index: useIndex,
  })

  if (_response?.warning) {
    console.log('ERROR', _response)
    console.log($type, query)
  }

  dbRef.current
    .explain({
      selector: {
        ...query,
        $type,
      },
      use_index: useIndex,
    })
    .then((explained) => {
      console.log(explained.index.ddoc)
      // detailed explained info can be viewed
    })

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
    response = await dbRef.current.get('user_preference')
  } catch (err) {
    console.error('user session not found')
  }
  return response
}
