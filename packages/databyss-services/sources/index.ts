import { setDocument } from '@databyss-org/data/mutations'
import { DocumentType } from '@databyss-org/data/interfaces'
import { Source } from '../interfaces'

export const setSource = (data: Source) => setDocument(data, DocumentType.Block)

// export const deleteSource = (_id: string) => httpDelete(`/sources/${_id}`)
