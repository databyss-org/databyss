import { Page, PageHeader } from '../../../interfaces/Page'
import { db, addTimeStamp } from '../../db'

const savePageHeader = async (data: Page | PageHeader) => {
  await db.upsert(data._id, (oldDoc) => ({ ...oldDoc, ...addTimeStamp(data) }))
}

export default savePageHeader
