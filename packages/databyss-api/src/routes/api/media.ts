import express from 'express'
import { DOMParser } from 'xmldom'
import fetch from 'node-fetch'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'
import {
  validURL,
  getYoutubeAttributes,
  getWebsiteAttributes,
  getImageAttributes,
  getHtmlAttributes,
  getTwitterAttributes,
} from './helpers/remoteMedia'

const router = express.Router()

export interface MediaResponse {
  mediaType: MediaTypes | null
  title: string | null
  height?: number | null
  width?: number | null
  src: string | null
  openGraphJson?: string | null
}

const isHTML = (str: string) => {
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
  image: /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/,
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
      const _fetchRes = await fetch(_url)

      const contentType = _fetchRes.headers.get('Content-Type')
      // return image content
      if (contentType && contentType?.search('image') > -1) {
        const _response = await getImageAttributes(_url)
        return res.status(200).json(_response).send()
      }

      // if twitter url
      if (_regExValidator.twitter.test(_url)) {
        const _response = getTwitterAttributes(_url)
        return res.status(200).json(_response).send()
      }
      // get youtube attributes
      if (_regExValidator.youtube.test(_url)) {
        const _response = await getYoutubeAttributes(_url)
        return res.status(200).json(_response).send()
      }

      // assume regular url
      const _response = await getWebsiteAttributes(_url)
      return res.status(200).json(_response).send()
    }
  }
  return res.status(200).json({}).send()
})

// // @route    GET api/media/remote
// // @desc     returns imaged data
// // @access   public
// router.post('/remote', async (req, res) => {
//   const _url = req.body.url
//   const imageResponse: MediaResponse = {
//     mediaType: null,
//     title: null,
//     height: null,
//     width: null,
//     src: null,
//   }

//   if (_url) {
//     const _response = await fetch(_url)

//     const contentType = _response.headers.get('Content-Type')
//     // is image
//     if (contentType && contentType?.search('image') > -1) {
//       imageResponse.src = _url
//       imageResponse.mediaType = MediaTypes.IMAGE
//       // get title from image
//       let _title = _url.split('/')
//       _title = _title[_title.length - 1]
//       _title = _title.split('?')[0].split('.')[0]
//       imageResponse.title = decodeURIComponent(_title)
//       const _dimensions = await requestImageSize(_url)
//       imageResponse.width = _dimensions.width
//       imageResponse.height = _dimensions.height
//     }
//   }

//   return res.status(200).json(imageResponse).send()
// })

export default router
