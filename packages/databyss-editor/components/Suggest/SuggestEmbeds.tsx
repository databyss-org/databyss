import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@databyss-org/slate'
import { MediaTypes, BlockType, Embed } from '@databyss-org/services/interfaces'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks/useBlocksInPages'
import {
  weightedSearch,
  prefixSearchAll,
} from '@databyss-org/services/blocks/filter'
import { Text, View } from '@databyss-org/ui/primitives'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { useEditorContext } from '../../state/EditorProvider'
import { validURL } from '../../lib/inlineUtils/initiateEmbedInput'

import { setEmbedMedia } from '../../lib/inlineUtils'
import { Block } from '../../../databyss-services/interfaces/Block'

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

const getIframeAttrs = (code: string): IframeAttributes | false => {
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

const SuggestEmbeds = ({
  query,
  onSuggestionsChanged,
  menuHeight,
  dismiss,
}) => {
  const editor = useEditor() as ReactEditor & Editor
  const embedRes = useBlocksInPages(BlockType.Embed)
  const { state, setContent } = useEditorContext()

  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState<null | Block[]>(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [iframeAtts, setIframeAtts] = useState<IframeAttributes | false>(false)

  useEffect(() => {
    const _iFrame = getIframeAttrs(query)
    setIframeAtts(_iFrame)
  }, [query])

  const filterSuggestions = (_topics) => {
    if (!_topics.length) {
      return []
    }
    return query?.length
      ? _topics
          .map(weightedSearch(query))
          .filter(prefixSearchAll(query))
          .sort((a, b) => (a.weight < b.weight ? 1 : -1))
      : []
  }

  const updateSuggestions = () => {
    if (!suggestions?.length) {
      return
    }
    const _nextSuggestions = filterSuggestions(suggestions)
    onSuggestionsChanged(_nextSuggestions)
    setFilteredSuggestions(_nextSuggestions)
  }

  useEffect(updateSuggestions, [query, suggestions])

  const setEmbed = (embed: Embed | void) => {
    if (embed) {
      setEmbedMedia({
        editor,
        state,
        setContent,
        hasSuggestion: embed,
      })
    }

    if (iframeAtts) {
      setEmbedMedia({
        editor,
        state,
        setContent,
        attributes: iframeAtts,
      })
    }
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
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
      e.preventDefault()
      e.stopPropagation()
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current) {
          setEmbed()
        }
      })
    }
  })

  if (!embedRes.isSuccess) {
    return <LoadingFallback queryObserver={embedRes} />
  }

  if (!suggestions && embedRes.data) {
    setSuggestions(Object.values(embedRes.data))
  }

  const onEmbedSelected = (embed) => {
    setEmbed(embed)

    dismiss()
  }

  const Suggestion = () => {
    // if not iframe suggestion, check if suggestion with same title exists
    if (!iframeAtts) {
      return (
        <View
          overflowX="hidden"
          overflowY="auto"
          maxHeight={pxUnits(menuHeight)}
        >
          {filteredSuggestions.map((s: Embed) => (
            // eslint-disable-next-line react/jsx-indent
            <DropdownListItem
              label={s.text.textValue}
              key={s._id}
              onPress={() => onEmbedSelected({ ...s, type: BlockType.Embed })}
            />
          ))}
        </View>
      )
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
      {filteredSuggestions && query?.length ? (
        Suggestion()
      ) : (
        <>
          <Text variant="uiTextSmall" color="gray.3" display="inline" p="small">
            {query?.length
              ? 'press enter to embed...'
              : 'paste a link or embed code...'}
          </Text>

          {query?.length ? Suggestion() : null}
        </>
      )}
    </View>
  )
}

export default SuggestEmbeds
