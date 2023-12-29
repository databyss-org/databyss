import express from 'express'
import request from 'request'
import fetch from 'node-fetch'

import {
  getYoutubeAttributes,
  getWebsiteAttributes,
  getImageAttributes,
  getHtmlAttributes,
  getTwitterAttributes,
  getDropboxAttributes,
  getInstagramAttributes,
  isHTML,
  regExValidator,
  opengraph,
} from '@databyss-org/services/embeds/remoteMedia'
import wrap from '../../lib/guardedAsync'

const router = express.Router()

// @route    GET api/media/opengraph
// @desc     returns opengraph data
// @access   public
router.post(
  '/opengraph',
  wrap(async (req, res) => {
    const _url = req.body.url
    if (_url) {
      const _result = await opengraph(_url)
      return res.status(200).json(_result ?? {}).send()
    }
    return res.status(200).json({}).send()
  })
)

// @route    GET api/media/proxy
// @desc     returns proxy info
// @access   public
router.get(
  '/proxy',
  wrap(async (req, res) => {
    let _url = req.query.url as string
    _url = decodeURIComponent(_url)

    const STRIP_HEADERS = ['cross-origin-resource-policy']

    if (_url) {
      return request(_url)
        .on('error', () => {
          res.status(400).send()
        })
        .on('response', (response) =>
          STRIP_HEADERS.forEach((header) => {
            delete response.headers[header]
          })
        )
        .pipe(res)
    }
    return res.status(404).send()
  })
)

export default router
