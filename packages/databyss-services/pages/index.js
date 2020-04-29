import { httpGet, httpPost, httpDelete } from '../lib/requestApi'

// TODO: Add native versions of these

export const getPage = _id => httpGet(`/pages/${_id}`)

export const savePage = data => httpPost('/pages/v2/', { data })

export const loadPage = id => httpGet(`/pages/populate-x/${id}`)

export const seedPage = data => httpPost(`/pages/`, { data })

export const getAllPages = () => httpGet(`/pages/`)

export const deletePage = id => httpDelete(`/pages/${id}`)

export const setDefaultPage = id => httpPost(`/accounts/page/${id}`)
