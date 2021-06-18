import requestImageSize from 'request-image-size'
import { DOMParser } from 'xmldom'
import ogs from 'open-graph-scraper'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'
import { MediaResponse, MAX_WIDTH, _regExValidator } from '../media'

export const getImageAttributes = async (url: string) => {
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
    openGraphJson: null,
  }

  _response.src = url
  _response.mediaType = MediaTypes.IMAGE
  // get title from image
  const urlPath = url.split('/')
  let _title = urlPath[urlPath.length - 1]
  _title = _title.split('?')[0].split('.')[0]
  _response.title = decodeURIComponent(_title)
  const _dimensions = await requestImageSize(url)
  _response.width = _dimensions.width
  _response.height = _dimensions.height
  return _response
}

export const getHtmlAttributes = (code: string) => {
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
  }

  const _iFrameAllowList = {
    width: true,
    height: true,
    src: true,
    title: true,
    id: true,
  }
  try {
    // attempt to parse iframe
    const parsed = new DOMParser({
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
    }).parseFromString(code.trim(), 'text/html')

    const _iframe = parsed.getElementsByTagName('iframe')
    if (_iframe.length) {
      const _firstNode = _iframe[0]

      if (_firstNode?.tagName === 'iframe') {
        // if iframe exists get all attribute properties

        Array.from(_firstNode.attributes).forEach((i: any) => {
          // only get properties in allow list
          if (_iFrameAllowList[i.name]) _response[i.name] = i.value
        })

        // scale iframe for max width of 500 - 16 (padding)
        if (_response.width && MAX_WIDTH < _response.width) {
          const _widthRatio = MAX_WIDTH / _response.width

          _response.mediaType = MediaTypes.IFRAME
          _response.width *= _widthRatio

          if (_response.height) {
            _response.height *= _widthRatio
          }
        }

        return _response
      }
    }

    // parse as regular html
    // TODO: what  are these dimension
    _response.height = 200
    _response.width = 300
    _response.src = code
    _response.mediaType = MediaTypes.HTML
    _response.title = `html fragment ${Date.now()}`
    return _response
  } catch (err) {
    return _response
  }
}

export const getTwitterAttributes = async (url: string) => {
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
  }
  // convert tweet to regex values
  const _regex = /https*:\/\/twitter\.com\/(?<USER>.+?)\/status\/(?<TID>\d+)/
  const match = _regex.exec(url)
  let username = ''
  let tweetId = ''
  if (match?.groups) {
    username = match.groups.USER
    tweetId = match.groups.TID
  }
  _response.width = 350
  _response.height = 175
  _response.src = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`
  _response.title = `tweet by ${username} ${tweetId}`
  _response.mediaType = MediaTypes.TWITTER

  // add fetch with custom useragent
  // https://stackoverflow.com/questions/62526483/twitter-website-doesnt-have-open-graph-tags
  try {
    const options = {
      url,
      headers: {
        'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      },
    }

    const _data = await ogs(options)
    const { result } = _data
    if (result.success) {
      // check if youtube link
      _response.openGraphJson = JSON.stringify(result)
    }

    return _response
  } catch (err) {
    return _response
  }
}

export const getYoutubeAttributes = async (url) => {
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
  }
  // pull video id from url
  const match = url.match(_regExValidator.youtube)
  const _id = match[2]
  _response.mediaType = MediaTypes.YOUTUBE
  _response.width = MAX_WIDTH
  _response.height = 273
  _response.src = `https://www.youtube.com/embed/${_id}`

  // get open graph information

  const options = { url }
  try {
    const _data = await ogs(options)
    const { result, error } = _data
    console.log('error is', error)
    console.log('result is', result)
    if (result.success) {
      // check if youtube link
      if (result.ogSiteName === 'YouTube') {
        _response.title = result.ogTitle
        // TODO:_response.openGraphJson
      }
      _response.openGraphJson = JSON.stringify(result)
    }

    return _response
  } catch (err) {
    console.log('in catch', err)
    return _response
  }
}

export const getDropboxAttributes = async (url) => {
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
  }

  const match = _regExValidator.dropbox.exec(url)
  let FID = ''
  let FNAME = ''
  if (match?.groups) {
    FID = match.groups.FID
    FNAME = match.groups.FNAME
  }

  // todo: FIND OUT DIMENSIONS
  _response.width = 350
  _response.height = 175
  _response.src = `https://www.dropbox.com/s/${FID}/${FNAME}?raw=1`
  _response.title = `dropbox file ${FNAME}`
  _response.mediaType = MediaTypes.WEBSITE
  return _response
}

export const getWebsiteAttributes = async (url) => {
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
    width: null,
    height: null,
  }
  try {
    const options = { url }
    const _data = await ogs(options)
    const { result } = _data

    if (result.success) {
      _response.title = `web page: ${result.ogTitle}`
      _response.src = url
      _response.width = 480
      _response.height = 300
      _response.mediaType = MediaTypes.WEBSITE
      _response.openGraphJson = JSON.stringify(result)
    }

    return _response
  } catch (err) {
    return _response
  }
}
