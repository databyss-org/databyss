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

// export const getPage = (_id: string): Promise<Page> => httpGet(`/pages/${_id}`)

export const savePage = (data: Page | PageHeader): Promise<boolean> =>
  httpPost('/pages', { data })

// export const savePatchBatch = (data: PatchBatch) =>
//   httpPatch(`/pages/${data.id}`, { data })
export const savePatchBatch = (data: PatchBatch) => pouchDb.savePatchData(data)

// export const loadPage = (id: string): Promise<Page> =>
//   httpGet(`/pages/populate/${id}`)
export const loadPage = (_id: string): Promise<Page | null> => populatePage(_id)

// export const getAllPages = (): Promise<PageHeader[]> => httpGet(`/pages/`)
export const getAllPages = (): Promise<MangoResponse<PageHeader>> =>
  fetchAllPages()

export const deletePage = (id: string) => httpDelete(`/pages/${id}`)

export const setPagePublic = (id: string, bool: boolean, accountId: string) =>
  httpPost(`/pages/${id}/public/`, { data: { isPublic: bool, accountId } })
