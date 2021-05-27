import express, { response } from 'express'
import ogs from 'open-graph-scraper'
import fetch from 'node-fetch'
import requestImageSize from 'request-image-size'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'

const router = express.Router()

interface MediaResponse {
  mediaType: MediaTypes | null
  title: string | null
  height?: number | null
  width?: number | null
  src: string | null
}

// @route    GET api/media/opengraph
// @desc     returns opengraph data
// @access   public
router.post('/opengraph', async (req, res) => {
  const _url = req.body.url
  const options = { url: _url }

  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
  }
  try {
    const _data = await ogs(options)
    const { result } = _data
    if (result.success) {
      console.log(result)
      // check if youtube link
      if (result.ogSiteName === 'YouTube') {
        _response.mediaType = MediaTypes.YOUTUBE
        _response.title = result.ogTitle
      }

      if (result.ogType === 'website' || result.ogType === 'article') {
        _response.title = `web page: ${result.ogTitle}`
        _response.src = _url
        _response.width = 480
        _response.height = 300
        _response.mediaType = MediaTypes.WEBSITE
      }

      return res.status(200).json(_response).send()
    }
  } catch (err) {
    return res.status(200).json({}).send()
  }
})

// @route    GET api/media/remote
// @desc     returns imaged data
// @access   public
router.post('/remote', async (req, res) => {
  const _url = req.body.url
  const imageResponse: MediaResponse = {
    mediaType: null,
    title: null,
    height: null,
    width: null,
    src: null,
  }

  if (_url) {
    const _response = await fetch(_url)

    const contentType = _response.headers.get('Content-Type')
    // is image
    if (contentType && contentType?.search('image') > -1) {
      imageResponse.src = _url
      imageResponse.mediaType = MediaTypes.IMAGE
      // get title from image
      let _title = _url.split('/')
      _title = _title[_title.length - 1]
      _title = _title.split('?')[0].split('.')[0]
      imageResponse.title = decodeURIComponent(_title)
      const _dimensions = await requestImageSize(_url)
      imageResponse.width = _dimensions.width
      imageResponse.height = _dimensions.height
    }
  }

  return res.status(200).json(imageResponse).send()
})

export default router
