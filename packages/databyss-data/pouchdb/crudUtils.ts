import { BlockType, Document } from '@databyss-org/services/interfaces'
import { pouchDataValidation } from './db'
import { dbRef } from './dbRef'
import { addTimeStamp } from './docUtils'
import { DocumentType } from './interfaces'

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
