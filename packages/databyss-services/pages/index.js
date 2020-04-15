import { httpGet, httpPost } from '../lib/requestApi'

// TODO: Add native versions of these

export const getPage = _id => httpGet(`/pages/${_id}`)

export const savePage = data => httpPost('/pages', { data })

export const loadPage = id => httpGet(`/pages/populate/${id}`)

export const seedPage = data => httpPost(`/pages/`, { data })

export const getAllPages = () => httpGet(`/pages/`)

export const deletePage = id => httpDelete(`/pages/${id}`)
