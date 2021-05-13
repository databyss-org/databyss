import React, { useState, useEffect, useRef } from 'react'
import Iframe from 'react-iframe'
import { Editor, Transforms } from '@databyss-org/slate'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { Text, Button, Icon, View, RawHtml } from '@databyss-org/ui/primitives'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { prefixSearchAll } from '@databyss-org/services/blocks'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useEditorContext } from '../../state/EditorProvider'
import { validURL } from '../../lib/inlineUtils/initiateEmbedInput'
import { setEmbedMediaWithoutSuggestion } from '../../lib/inlineUtils/setEmbedMediaWithoutSuggestion'
import {
  onBakeInlineAtomic,
  setAtomicWithoutSuggestion,
} from '../../lib/inlineUtils'

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
  border: true,
  frameborder: true,
}

enum MediaTypes {
  IFRAME = 'iframe',
  IMAGE = 'image',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  CODE = 'CODE',
}

export type IframeAttributes = {
  width?: number
  height?: number
  title?: string
  src?: string
  // border?: number
  // frameborder?: number
  mediaType?: MediaTypes
}

const getIframeAttrs = (code: string): IframeAttributes | false => {
  if (!(isHTML(code) || validURL(code))) {
    return false
  }

  try {
    const MAX_WIDTH = 484
    const MAX_HEIGHT = 300

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

const SuggestEmbeds = ({
  query,
  // dismiss,
  // onSuggestionsChanged,
  // inlineAtomic,
}) => {
  const editor = useEditor() as ReactEditor & Editor

  console.log(query)

  const [iframeAtts, setIframeAtts] = useState<IframeAttributes | false>(false)
  useEffect(() => {
    const _iFrame = getIframeAttrs(query)
    setIframeAtts(_iFrame)
  }, [query])

  // const topicsRes = useBlocksInPages(BlockType.Topic)

  const { state, setContent } = useEditorContext()

  const pendingSetContent = useRef(false)

  // const [suggestions, setSuggestions] = useState<null | any[]>(null)
  // const [filteredSuggestions, setFilteredSuggestions] = useState([])

  // const onTopicSelected = (topic) => {
  //   if (!inlineAtomic) {
  //     replace([topic])
  //   } else {
  //     // if topic is provided, set the flag so the event listener will ignore command
  //     pendingSetContent.current = true

  //     onBakeInlineAtomic({
  //       editor,
  //       state,
  //       suggestion: topic,
  //       setContent,
  //     })
  //   }
  //   dismiss()
  // }

  // const filterSuggestions = (_topics) => {
  //   if (!_topics.length) {
  //     return []
  //   }
  //   return _topics.filter(prefixSearchAll(query)).slice(0, 4)
  // }

  // const updateSuggestions = () => {
  //   if (!suggestions?.length) {
  //     return
  //   }
  //   const _nextSuggestions = filterSuggestions(suggestions)
  //   onSuggestionsChanged(_nextSuggestions)
  //   setFilteredSuggestions(_nextSuggestions)
  // }

  // useEffect(updateSuggestions, [query, suggestions])

  const setEmbedWithoutSuggestion = () =>
    iframeAtts &&
    setEmbedMediaWithoutSuggestion({
      editor,
      state,
      setContent,
      attributes: iframeAtts,
    })

  useEventListener('keydown', (e) => {
    /*
    bake topic if arrow up or down without suggestion
    */
    // if (
    //   !filteredSuggestions.length &&
    //   (e.key === 'ArrowDown' || e.key === 'ArrowUp')
    // ) {
    //   setCurrentTopicWithoutSuggestion()
    // }

    if (e.key === 'Enter') {
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current) {
          setEmbedWithoutSuggestion()
        }
      })
    }
  })

  // if (!topicsRes.isSuccess) {
  //   return <LoadingFallback queryObserver={topicsRes} />
  // }

  // if (!suggestions) {
  //   setSuggestions(Object.values(topicsRes.data))
  // }

  const IFrame = () => {
    if (!iframeAtts) {
      return null
    }

    return (
      <View p="small">
        <iframe
          id={query}
          title={query}
          // border="0px"
          frameBorder="0px"
          {...iframeAtts}
        />
      </View>
    )
  }

  return (
    <View>
      <Text variant="uiTextSmall" color="gray.3" display="inline" p="small">
        {query.length
          ? 'press enter to embed...'
          : 'paste a link or embed code...'}
      </Text>
      {query.length ? IFrame() : null}
    </View>
  )
}

export default SuggestEmbeds
