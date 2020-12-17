import { httpGet, httpPost, httpDelete, httpPatch } from '../lib/requestApi'
import { Page, PatchBatch, PageHeader } from '../interfaces'

import { db } from '@databyss-org/services/database/db.ts'
// packages/databyss-services/database/pages/index.ts
import * as pouchDb from '../database/pages'
import { populatePage, fetchAllPages } from '../database/_helpers'
// TODO: Add native versions of these

interface MangoResponse<D> {
  docs: D[]
}

export const savePage = (data: Page | PageHeader): Promise<boolean> =>
  httpPost('/pages', { data })

export const savePatchBatch = (data: PatchBatch) => pouchDb.savePatchData(data)

export const loadPage = (_id: string): Promise<Page | null> =>
  pouchDb.populatePage(_id)

export const getAllPages = (): Promise<MangoResponse<PageHeader>> =>
  pouchDb.fetchAllPages()

export const deletePage = (id: string) => httpDelete(`/pages/${id}`)

export const setPagePublic = (id: string, bool: boolean, accountId: string) =>
  httpPost(`/pages/${id}/public/`, { data: { isPublic: bool, accountId } })
