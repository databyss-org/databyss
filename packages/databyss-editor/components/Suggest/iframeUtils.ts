import { MediaTypes } from '../../../databyss-services/interfaces/Block'
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
      // check for twitter link
      if (_regExValidator.twitter.test(code)) {
        // convert tweet to regex values

        // TODO: shouldnt use twitterframe
        _atts = {
          // border: 0,
          // frameborder: 0,
          width: MAX_WIDTH,
          height: 220,
          src: `https://twitframe.com/show?url=${encodeURI(code)}`,
          title: 'tweet',
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
          title: 'youtube',
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
