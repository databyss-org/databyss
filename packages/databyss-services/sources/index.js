import { httpGet, httpPost, httpDelete } from '../lib/requestApi'
import request from '../lib/request'

// TODO: Add native versions of these

export const getSource = _id => httpGet(`/sources/${_id}`)

export const setSource = data => httpPost('/sources', { data })

export const getSources = () => httpGet('/sources')

export const getSourceFromList = list =>
  httpGet(`/sources/list?array=${JSON.stringify(list)}`)

export const deleteSource = id => httpDelete(`/sources/${id}`)

export const getPageSources = id => httpGet(`/sources/pages/${id}`)

export const searchSource = query =>
  request(
    `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`
  )
