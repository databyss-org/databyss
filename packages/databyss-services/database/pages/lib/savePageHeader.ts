import { Page, PageHeader } from '../../../interfaces/Page'
import { db } from '../../db'

const savePageHeader = async (data: Page | PageHeader) => {
  await db.upsert(data._id, (oldDoc) => ({ ...oldDoc, ...data }))
}

export default savePageHeader
