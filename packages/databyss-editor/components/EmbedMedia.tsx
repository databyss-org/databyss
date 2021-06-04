import React, { useEffect, useState, useMemo } from 'react'
import {
  useSelected,
  useFocused,
  useSlate,
  ReactEditor,
} from '@databyss-org/slate-react'
import { Node, Editor as SlateEditor } from '@databyss-org/slate'
import { View, Icon, Button } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import _ from 'lodash'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks/useBlocks'
import {
  Embed,
  BlockType,
  MediaTypes,
} from '@databyss-org/services/interfaces/Block'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { IframeAttributes } from './Suggest/iframeUtils'
import { UnfetchedMedia } from './UnfetchedMedia'
import { IframeComponent } from './Suggest/IframeComponent'

export const isHttpInsecure = (url) => {
  const _regEx = /^http:\/\//
  return _regEx.test(url)
}

export const EmbedMedia = ({
  _children,
  attributes,
  _element,
  onInlineClick,
}) => {
  const blocksRes = useBlocks(BlockType.Embed)
  const [data, setData] = useState<null | Embed>()
  const [highlight, setHighlight] = useState(false)
  const editor = useSlate() as ReactEditor & SlateEditor
  const _isSelected = useSelected()

  // only compute if current block is focused
  const _isFocused = useFocused()
  // check if embed should have anoutline
  useEffect(() => {
    if (!_isSelected && highlight) {
      setHighlight(false)
      return
    }
    if (_isSelected && _isFocused && editor?.selection) {
      // get current leaf value
      const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)
      if (_currentLeaf.embed && !highlight) {
        setHighlight(true)
      } else if (highlight && !_currentLeaf.embed) {
        setHighlight(false)
      }
    }
  }, [editor?.selection, _isSelected, _isFocused])

  useEffect(() => {
    if (blocksRes.status === 'success') {
      // load attributes
      const _data = blocksRes.data[_element.atomicId] as Embed
      if (_data && !_.isEqual(_data, data)) {
        setData(_data)
      }
    }
  }, [blocksRes])

  const IFrame = () => {
    if (!data) {
      return null
    }
    const _atts: IframeAttributes = {
      width: data.detail?.dimensions?.width,
      height: data.detail?.dimensions?.height,
      src: data.detail.src,
      title: data.detail?.title,
      mediaType: data.detail?.mediaType,
      openGraphJson: data.detail?.openGraphJson,
    }

    const EmbededComponent = () =>
      useMemo(() => {
        const _isUnfetched =
          !_atts?.mediaType || _atts.mediaType === MediaTypes.UNFETCHED

        if (_isUnfetched) {
          return <UnfetchedMedia atomicId={_element.atomicId} src={_atts.src} />
        }

        const _src = isHttpInsecure(_atts.src)
          ? `${process.env.API_URL}/media/proxy?url=${encodeURIComponent(
              _atts.src!
            )}`
          : _atts.src
        const { height, width, mediaType, openGraphJson } = _atts
        return (
          <IframeComponent
            openGraphData={openGraphJson}
            highlight={highlight}
            src={_src!}
            height={height!}
            width={width!}
            mediaType={mediaType!}
          />
        )
      }, [_atts.src])

    return (
      <View position="relative" id="testing" width={_atts.width}>
        <View position="relative" zIndex={1}>
          <EmbededComponent />
        </View>
        <View
          zIndex={2}
          position="absolute"
          top="small"
          right="small"
          borderRadius="default"
          // backgroundColor={gray[6]}
        >
          <Button
            variant="editSource"
            onPress={() =>
              onInlineClick({ atomicType: 'EMBED', id: _element.atomicId })
            }
          >
            <Icon sizeVariant="tiny" color="background.5">
              <PenSVG />
            </Icon>
          </Button>
        </View>
      </View>
    )
  }

  return useMemo(
    () => (
      <span
        {...attributes}
        style={{
          maxWidth: '480px',
          position: 'relative',
          display: 'block',
          borderRadius: '3px',
          //    padding: '3px',
        }}
      >
        <span
          contentEditable={false}
          id="inline-embed"
          style={{
            position: 'relative',
            // TODO: change  this back to a high number
            zIndex: 10,
            display: 'block',
          }}
        >
          {data ? <IFrame /> : <LoadingFallback />}
        </span>
        <span
          style={{
            padding: '8px',
            // todo: change this back  to zero
            zIndex: 0,
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          {_children}
        </span>
      </span>
    ),
    [data?.text.textValue, highlight]
  )
}
