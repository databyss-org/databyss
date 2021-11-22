import express from 'express'
import request from 'request'

const router = express.Router()

const _bsproxy = (endpoint: string) => async (req, res) => {
  const STRIP_RES_HEADERS = ['cross-origin-resource-policy']

  // console.log('[BSPROXY] req headers', req.headers)

  return request(`https://${endpoint}`, {
    method: req.method,
    headers: {
      ...req.headers,
      host: endpoint,
    },
    json: true,
    body: req.body,
  })
    .on('response', (response) =>
      STRIP_RES_HEADERS.forEach((header) => {
        delete response.headers[header]
      })
    )
    .pipe(res)
}

// @route    GET api/log/sessions
// @desc     bugsnag sessions proxy
// @access   public
router.post('/sessions', _bsproxy('sessions.bugsnag.com'))

// @route    GET api/log/notify
// @desc     bugsnag notify proxy
// @access   public
router.post('/notify', _bsproxy('notify.bugsnag.com'))

export default router
