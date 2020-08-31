import { httpGet, httpPost, httpDelete, httpPatch } from '../lib/requestApi'
import { Page, PatchBatch, PageHeader } from '../interfaces'

// TODO: Add native versions of these

export const getPage = (_id: string): Promise<Page> => httpGet(`/pages/${_id}`)

export const savePage = (data: Page | PageHeader): Promise<boolean> =>
  httpPost('/pages', { data })

export const savePatchBatch = (data: PatchBatch) =>
  httpPatch(`/pages/${data.id}`, { data })

export const loadPage = (id: string): Promise<Page> =>
  httpGet(`/pages/populate/${id}`)

export const getAllPages = (): Promise<PageHeader[]> => httpGet(`/pages/`)

export const deletePage = (id: string) => httpDelete(`/pages/${id}`)

export const setDefaultPage = (id: string) => httpPost(`/accounts/page/${id}`)

export const setPagePublic = (id: string, bool: boolean, accountId: string) =>
  httpPost(`/pages/${id}/public/`, { data: { isPublic: bool, accountId } })
