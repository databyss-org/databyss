// import requestImageSize from 'request-image-size'
import { DOMParser } from 'xmldom'
import ogs from 'open-graph-scraper'
import {
  EmbedDetail,
  MediaTypes,
} from '@databyss-org/services/interfaces/Block'
import { parseTweetUrl } from '@databyss-org/services/embeds/twitter'
import { validURL } from '@databyss-org/services/lib/util'
import InstagramApi from 'simple-instagram-api'
import { decode } from 'html-entities'

export async function opengraph(urlOrHtml: string): Promise<EmbedDetail> {
  const _unknown: EmbedDetail = {
    src: urlOrHtml,
    mediaType: MediaTypes.UNFETCHED
  }
  if (!(isHTML(urlOrHtml) || validURL(urlOrHtml))) {
    return _unknown
  }

  // check if string is code
  if (isHTML(urlOrHtml)) {
    return getHtmlAttributes(urlOrHtml)
  }

  if (validURL(urlOrHtml)) {
    // check for image
    // TODO: just fetch headers
    const _fetchRes = await fetch(urlOrHtml)

    const contentType = _fetchRes.headers.get('Content-Type')
    // return image content
    if (contentType && contentType?.search('image') > -1) {
      return getImageAttributes(urlOrHtml)
    }

    if (regExValidator.twitter.test(urlOrHtml)) {
      return getTwitterAttributes(urlOrHtml)
    }
    if (regExValidator.youtube.test(urlOrHtml)) {
      return getYoutubeAttributes(urlOrHtml)
    }
    if (regExValidator.instagram.test(urlOrHtml)) {
      return getInstagramAttributes(urlOrHtml)
    }
    if (regExValidator.dropbox.test(urlOrHtml)) {
      return getDropboxAttributes(urlOrHtml)
    }

    // assume regular url
    return getWebsiteAttributes(urlOrHtml)
  }

  return _unknown
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

export const regExValidator = {
  twitter: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
  youtube: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  image: /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)/,
  dropbox: /https*:\/\/www\.dropbox\.com\/s\/(?<FID>.+?)\/(?<FNAME>.+?)\?dl=0/,
  instagram: /http(?:s)?:\/\/(?:www\.)?instagram\.com\/p\/(?<PID>[^/]+)\/?/,
}

export const MAX_WIDTH = 484


export const getImageAttributes = async (url: string) => {
  const _response: EmbedDetail = {
    mediaType: MediaTypes.IMAGE,
    src: url,
  }

  // get title from image
  const urlPath = url.split('/')
  let _title = urlPath[urlPath.length - 1]
  _title = _title.split('?')[0].split('.')[0]
  _response.title = decodeURIComponent(_title)
  // _response.dimensions = await requestImageSize(url)
  return _response
}

export const getHtmlAttributes = (code: string) => {
  const _response: EmbedDetail = {
    mediaType: MediaTypes.HTML,
    src: code,
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

        return _response
      }
    }

    // parse as regular html
    _response.title = `html fragment ${Date.now()}`
    return _response
  } catch (err) {
    return _response
  }
}

export const getTwitterAttributes = async (url: string) => {
  const _response: EmbedDetail = {
    mediaType: MediaTypes.TWITTER,
    src: url,
  }
  // convert tweet to regex values
  const _tweetAttributes = parseTweetUrl(url)
  if (_tweetAttributes) {
    _response.title = `Tweet by ${_tweetAttributes.user} ${_tweetAttributes.tweetId}`
  }
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
  const _response: EmbedDetail = {
    mediaType: MediaTypes.YOUTUBE,
    title: 'default title',
    src: url,
  }

  // get open graph information
  const options = { url }
  try {
    const _data = await ogs(options)
    const { result } = _data
    if (result.success) {
      // check if youtube link
      if (result.ogSiteName === 'YouTube') {
        _response.title = result.ogTitle
      }
      _response.openGraphJson = JSON.stringify(result)
    }

    return _response
  } catch (err) {
    console.log('[remoteMedia] YouTube OG fetch failed', err)
    return _response
  }
}

export const getInstagramAttributes = async (url) => {
  const _response: EmbedDetail = {
    mediaType: MediaTypes.WEBSITE,
    title: `Instagram ${Date.now()}`,
    src: url,
  }

  const _matches = regExValidator.instagram.exec(url)
  if (!_matches?.groups?.PID) {
    console.log('[getInstagramAttributes] no Post ID found')
    return url
  }
  const _postId = _matches?.groups?.PID
  console.log('[getInstagramAttributes] Post ID', _postId)

  try {
    const _postData = await InstagramApi.get(_postId)
    const _ogData = {
      ogImage: {
        url: `${process.env.API_URL}/media/proxy?url=${encodeURIComponent(
          _postData.url
        )}`,
      },
      ogDescription: decode(_postData.caption),
      ogSiteName: 'Instagram',
      ogTitle: `Instagram post ${_postId}`,
    }
    _response.mediaType = MediaTypes.INSTAGRAM
    _response.title = `Instagram post ${_postId}`
    _response.openGraphJson = JSON.stringify(_ogData)
    return _response
  } catch (err) {
    console.log('[remoteMedia] Instagram fetch failed', err)
    return _response
  }
}

export const getDropboxAttributes = async (url) => {
  const _response: EmbedDetail = {
    mediaType: MediaTypes.WEBSITE,
    src: url,
  }

  const match = regExValidator.dropbox.exec(url)
  let FID = ''
  let FNAME = ''
  if (match?.groups) {
    FID = match.groups.FID
    FNAME = match.groups.FNAME
  }

  _response.src = `https://www.dropbox.com/s/${FID}/${FNAME}?raw=1`
  _response.title = `dropbox file ${FNAME}`
  return _response
}

export const getWebsiteAttributes = async (url) => {
  const _response: EmbedDetail = {
    mediaType: MediaTypes.WEBSITE,
    title: `web url: ${url}`,
    src: url,
  }
  try {
    const options = { url }
    const _data = await ogs(options)
    const { result } = _data

    if (result.success) {
      _response.title = `web page: ${result.ogTitle}`
      _response.openGraphJson = JSON.stringify(result)
    }

    return _response
  } catch (err) {
    return _response
  }
}
