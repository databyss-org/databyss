import { MediaTypes } from '@databyss-org/services/interfaces'
import { validURL } from '../../lib/inlineUtils/initiateEmbedInput'

export const _regExValidator = {
  twitter: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
  youtube: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  image: /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/,
}

const isHTML = (str: string) => {
  const doc = new DOMParser().parseFromString(str, 'text/html')
  return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1)
}

const _iFrameAllowList = {
  width: true,
  height: true,
  src: true,
  title: true,
  id: true,
}

export type IframeAttributes = {
  width?: number
  height?: number
  title?: string
  src?: string
  code?: string
  // border?: number
  // frameborder?: number
  mediaType?: MediaTypes
}

export const getIframeAttrs = (code: string): IframeAttributes | false => {
  if (!(isHTML(code) || validURL(code))) {
    return false
  }

  try {
    const MAX_WIDTH = 484
    // const MAX_HEIGHT = 300

    let _atts: IframeAttributes = {}

    // get iframe attributes from html
    if (isHTML(code)) {
      // attempt to parse iframe
      const parsed = new DOMParser().parseFromString(code.trim(), 'text/html')

      const _iframe = parsed.body

      const _firstNode = _iframe.children[0]
      if (_firstNode?.tagName === 'IFRAME') {
        // if iframe exists get all attribute properties

        Array.from(_firstNode.attributes).forEach((i) => {
          // only get properties in allow list
          if (_iFrameAllowList[i.name]) _atts[i.name] = i.value
        })

        // scale iframe for max width of 500 - 16 (padding)
        if (_atts?.width && MAX_WIDTH < _atts.width) {
          const _widthRatio = MAX_WIDTH / _atts.width

          _atts = {
            mediaType: MediaTypes.IFRAME,
            ..._atts,
            width: _atts.width * _widthRatio,
            // scale height if height was property
            ...(_atts?.height && { height: _atts.height * _widthRatio }),
          }
        }

        return _atts
      }

      return false
    }
    // convert link to iframe attrs
    if (validURL(code)) {
      // scrape for open graph data

      // check for twitter link
      if (_regExValidator.twitter.test(code)) {
        // convert tweet to regex values
        const _regex = /https*:\/\/twitter\.com\/(?<USER>.+?)\/status\/(?<TID>\d+)/
        const match = _regex.exec(code)
        let username = ''
        let tweetId = ''
        if (match?.groups) {
          username = match.groups.USER
          tweetId = match.groups.TID
        }
        _atts = {
          // border: 0,
          // frameborder: 0,
          width: MAX_WIDTH,
          height: 205,
          src: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
          title: `tweet by ${username} ${tweetId}`,
          mediaType: MediaTypes.TWITTER,
        }
        return _atts
      }
      // check for youtube links
      if (_regExValidator.youtube.test(code)) {
        // pull video id from url
        const match = code.match(_regExValidator.youtube)
        const _id = match && match[2].length === 11 ? match[2] : null

        if (!_id) {
          return false
        }
        _atts = {
          mediaType: MediaTypes.YOUTUBE,
          // border: 0,
          // frameborder: 0,
          width: MAX_WIDTH,
          height: 273,
          src: `https://www.youtube.com/embed/${_id}`,
        }
        return _atts
      }

      // check if image url
      if (_regExValidator.image.test(code)) {
        _atts = {
          // border: 0,
          // frameborder: 0,
          width: MAX_WIDTH,
          height: 300,
          src: code,
          title: 'image',
          mediaType: MediaTypes.IMAGE,
        }
        return _atts
      }
    }
  } catch (err) {
    console.log(err)
    return false
  }
  return false
}
