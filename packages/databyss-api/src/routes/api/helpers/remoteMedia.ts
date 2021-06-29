// import requestImageSize from 'request-image-size'
import { DOMParser } from 'xmldom'
import ogs from 'open-graph-scraper'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'
import { parseTweetUrl } from '@databyss-org/services/embeds/twitter'
import InstagramApi from 'simple-instagram-api'
import { MediaResponse, _regExValidator } from '../media'

export const getImageAttributes = async (url: string) => {
  const _response: MediaResponse = {
    mediaType: MediaTypes.IMAGE,
    title: null,
    src: url,
    dimensions: {
      width: null,
      height: null,
    },
    openGraphJson: null,
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
  const _response: MediaResponse = {
    mediaType: null,
    title: null,
    src: null,
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
    mediaType: MediaTypes.TWITTER,
    title: null,
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
  const _response: MediaResponse = {
    mediaType: null,
    title: 'default title',
    src: null,
  }
  // pull video id from url
  // const match = url.match(_regExValidator.youtube)
  // const _id = match[2]
  _response.mediaType = MediaTypes.YOUTUBE
  _response.src = url

  // get open graph information

  const options = { url }
  try {
    const _data = await ogs(options)
    const { result } = _data
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
    console.log('[remoteMedia] YouTube OG fetch failed', err)
    return _response
  }
}

export const getInstagramAttributes = async (url) => {
  const _response: MediaResponse = {
    mediaType: MediaTypes.WEBSITE,
    title: `Instagram ${Date.now()}`,
    src: url,
  }

  const _matches = _regExValidator.instagram.exec(url)
  if (!_matches?.groups?.PID) {
    console.log('[getInstagramAttributes] no Post ID found')
    return url
  }
  const _postId = _matches?.groups?.PID
  console.log('[getInstagramAttributes] Post ID', _postId)

  // const options = {
  //   url,
  //   headers: {
  //     'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
  //   },
  // }
  try {
    // const _data = await ogs(options)
    // const { result } = _data
    // if (result.success) {
    //   // rewrite ogImage.url
    //   _response.title = result.ogTitle
    //   if (result.ogImage?.url) {
    //     result.ogImage.url = `${
    //       process.env.API_URL
    //     }/media/proxy?url=${encodeURIComponent(result.ogImage.url)}`
    //   }
    //   _response.openGraphJson = JSON.stringify(result)
    // }

    const _postData = await InstagramApi.get(_postId)
    const _ogData = {
      ogImage: {
        url: `${process.env.API_URL}/media/proxy?url=${encodeURIComponent(
          _postData.url
        )}`,
      },
      ogDescription: _postData.caption,
      ogSiteName: 'Instagram',
      ogTitle: `Instagram post ${Date.now()}`,
    }
    _response.title = `Instagram post ${Date.now()}`
    _response.openGraphJson = JSON.stringify(_ogData)
    return _response
  } catch (err) {
    console.log('[remoteMedia] Instagram fetch failed', err)
    return _response
  }
}

export const getDropboxAttributes = async (url) => {
  const _response: MediaResponse = {
    mediaType: MediaTypes.WEBSITE,
    title: null,
    src: null,
  }

  const match = _regExValidator.dropbox.exec(url)
  let FID = ''
  let FNAME = ''
  if (match?.groups) {
    FID = match.groups.FID
    FNAME = match.groups.FNAME
  }

  _response.src = `https://www.dropbox.com/s/${FID}/${FNAME}?raw=1`
  _response.title = `dropbox file ${FNAME}`
  console.log('[getDropboxAttributes]', _response)
  return _response
}

export const getWebsiteAttributes = async (url) => {
  const _response: MediaResponse = {
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
