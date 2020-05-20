import { httpGet, httpPost, httpDelete, httpPatch } from '../lib/requestApi'

// TODO: Add native versions of these

export const getPage = _id => httpGet(`/pages/${_id}`)

export const savePage = data => httpPost('/pages', { data })

export const savePatch = data => httpPatch(`/pages/${data.id}`, { data })

export const loadPage = id => httpGet(`/pages/populate/${id}`)

export const seedPage = data => httpPost(`/pages/`, { data })

export const getAllPages = () => httpGet(`/pages/`)

export const deletePage = id => httpDelete(`/pages/${id}`)

export const setDefaultPage = id => httpPost(`/accounts/page/${id}`)
