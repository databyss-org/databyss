import express from 'express'
import { DOMParser } from 'xmldom'
import request from 'request'
import fetch from 'node-fetch'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'
import { validURL } from '@databyss-org/services/lib/util'
import {
  getYoutubeAttributes,
  getWebsiteAttributes,
  getImageAttributes,
  getHtmlAttributes,
  getTwitterAttributes,
  getDropboxAttributes,
} from './helpers/remoteMedia'

const router = express.Router()

export interface MediaResponse {
  mediaType: MediaTypes | null
  title: string | null
  dimensions?: {
    height?: number | null
    width?: number | null
  }
  src: string | null
  openGraphJson?: string | null
}

export const isHTML = (str: string) => {
  try {
    const _regEx = /<("[^"]*"|'[^']*'|[^'">])*>/
    const index = str.search(_regEx)
    if (index === -1) {
      return false
    }
    new DOMParser({
      errorHandler: {
        // warning: (w) => {
        //   throw new Error(w)
        // },
        error: (e) => {
          throw new Error(e)
        },
        fatalError: (e) => {
          throw new Error(e)
        },
      },
    }).parseFromString(str, 'text/html')

    return true
  } catch (err) {
    return false
  }
}

export const _regExValidator = {
  twitter: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
  youtube: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  image: /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)/,
  dropbox: /https*:\/\/www\.dropbox\.com\/s\/(?<FID>.+?)\/(?<FNAME>.+?)\?dl=0/,
}

export const MAX_WIDTH = 484

// @route    GET api/media/opengraph
// @desc     returns opengraph data
// @access   public
router.post('/opengraph', async (req, res) => {
  const _url = req.body.url
  if (_url) {
    if (!(isHTML(_url) || validURL(_url))) {
      return res.status(200).json({}).send()
    }

    // check if string is code
    if (isHTML(_url)) {
      const _response = getHtmlAttributes(_url)
      return res.status(200).json(_response).send()
    }

    if (validURL(_url)) {
      // check for image
      // TODO: just fetch headers
      const _fetchRes = await fetch(_url)

      const contentType = _fetchRes.headers.get('Content-Type')
      // return image content
      if (contentType && contentType?.search('image') > -1) {
        const _response = await getImageAttributes(_url)
        return res.status(200).json(_response).send()
      }

      // if twitter url
      if (_regExValidator.twitter.test(_url)) {
        const _response = await getTwitterAttributes(_url)
        return res.status(200).json(_response).send()
      }
      // get youtube attributes
      if (_regExValidator.youtube.test(_url)) {
        const _response = await getYoutubeAttributes(_url)
        return res.status(200).json(_response).send()
      }

      if (_regExValidator.dropbox.test(_url)) {
        const _response = await getDropboxAttributes(_url)
        return res.status(200).json(_response).send()
      }

      // assume regular url
      const _response = await getWebsiteAttributes(_url)

      return res.status(200).json(_response).send()
    }
  }
  return res.status(200).json({}).send()
})

// @route    GET api/media/proxy
// @desc     returns proxy info
// @access   public
router.get('/proxy', async (req, res) => {
  let _url = req.query.url as string
  _url = decodeURIComponent(_url)

  if (_url) {
    return request.get({ url: _url }).pipe(res)
  }
  return res.status(404).send()
})

export default router
