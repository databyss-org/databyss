import { BlockType, Document } from '@databyss-org/services/interfaces'
import tv4 from 'tv4'
import {
  sourceSchema,
  blockRelationSchema,
  selectionSchema,
  pageSchema,
  groupSchema,
  textSchema,
  entrySchema,
  topicSchema,
  pouchDocSchema,
  blockSchema,
  userPreferenceSchema,
  notificationSchema,
  pointSchema,
} from '@databyss-org/data/schemas'
import embedSchema from '../schemas/embedSchema'
import { dbRef } from './dbRef'
import { addTimeStamp } from './docUtils'
import { DocumentType } from './interfaces'

export const pouchDataValidation = (data) => {
  // remove undefined properties
  Object.keys(data).forEach((key) => {
    if (key === '_id' && data[key] === undefined) {
      console.error('invalid data', data)
      throw new Error(`_id is undefined`)
    }

    return data[key] === undefined ? delete data[key] : {}
  })

  // pouchDB validator
  const schemaMap = {
    [BlockType.Source]: sourceSchema,
    [BlockType.Entry]: entrySchema,
    [BlockType.Topic]: topicSchema,
    [BlockType.Embed]: embedSchema,
    [DocumentType.Group]: groupSchema,
    [DocumentType.Page]: pageSchema,
    [DocumentType.Selection]: selectionSchema,
    [DocumentType.BlockRelation]: blockRelationSchema,
    [DocumentType.UserPreferences]: userPreferenceSchema,
  }

  // add $ref schemas, these schemas are reused
  tv4.addSchema('text', textSchema)
  tv4.addSchema('point', pointSchema)
  tv4.addSchema('pouchDb', pouchDocSchema)
  tv4.addSchema('blockSchema', blockSchema)
  tv4.addSchema('notification', notificationSchema)

  if (data?._id?.includes('design/')) {
    return
  }
  let schema
  // user database determines the schema by the .type field

  if (data.doctype === DocumentType.Block) {
    schema = schemaMap[data.type]
  } else {
    schema = schemaMap[data.doctype]
  }

  // `this.schema &&` this will be removed when all schemas are implemented
  if (schema && !tv4.validate(data, schema, false, true)) {
    console.log('[pouchDataValidation]', data)
    console.error(
      `${schema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
    )
    // throw new Error(
    //   `${schema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
    // )
  }

  if (!schema) {
    console.log('NOT FOUND', data)
    console.error(`no schema found`)
    // throw new Error(
    //   `${schema.title} - ${tv4.error.message} -> ${tv4.error.dataPath}`
    // )
  }
}

// todo: use document type interface
export const bulkUpsert = async (upQdict: any) => {
  // compose updated documents to bulk upsert
  const _docs: any = []
  for (const _docId of Object.keys(upQdict)) {
    const { ...docFields } = upQdict[_docId]
    const _doc = {
      ...addTimeStamp({ ...docFields }),
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
