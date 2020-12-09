import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import { ResourceNotFoundError } from '../interfaces/Errors'
import {
  PUT_DOCUMENT,
  CREATE_DATABASE,
  CACHE_PAGE,
  UPDATE_DOC,
} from './constants'
import { createDB } from './database'

export function putDocument(doc, db, ref) {
  return (dispatch: Function) => {
    dispatch({
      type: PUT_DOCUMENT,
      payload: { doc },
    })
    db.upsert(doc._id, () => doc)
      .then((d) => {
        // update page ref
        const _pageDict = ref.current
        _pageDict[d.id] = d.rev
        ref.current = _pageDict
      })
      .catch((err) => console.log(err))
  }
}

export function getDatabase() {
  return (dispatch: Function) => {
    const _db = createDB()
    dispatch({
      type: CREATE_DATABASE,
      payload: { db: _db },
    })
  }
}

export function updatePage(doc) {
  return (dispatch: Function) => {
    dispatch({
      type: UPDATE_DOC,
      payload: { doc },
    })
  }
}

export function getDocument(id, db) {
  return (dispatch: Function) => {
    dispatch({
      type: CACHE_PAGE,
      payload: { id, doc: new ResourcePending() },
    })

    db.get(id)
      .then((doc) => {
        dispatch({
          type: CACHE_PAGE,
          payload: { id, doc },
        })
      })
      .catch((err) => {
        dispatch({
          type: CACHE_PAGE,
          payload: { id, doc: new ResourceNotFoundError() },
        })
      })
  }
}
