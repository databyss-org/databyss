import * as actions from '../actions'
import request from './request'

export const fetchSession = (args) =>
  actions.fetchSession({ ...args, _request: request })
export const endSession = actions.endSession
