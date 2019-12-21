import { httpGet, httpPost, httpDelete } from '../lib/requestApi'

// TODO: Add native versions of these

export const getSource = _id => httpGet(`/sources/${_id}`)

export const setSource = data => httpPost('/sources', { data })

export const getSources = () => httpGet('/sources')

export const deleteSource = id => httpDelete(`/sources/${id}`)
