import { upsert } from '../../utils'
import { DocumentType } from '../../interfaces'

const deletePage = (id: string) =>
  upsert({ doctype: DocumentType.Page, _id: id, doc: { _deleted: true } })

export default deletePage
