import React, { useEffect, useState, useMemo } from 'react'
import { View, Icon, Button } from '@databyss-org/ui/primitives'
import PenSVG from '@databyss-org/ui/assets/pen.svg'
import { useEditor } from '@databyss-org/slate-react'
import colors from '@databyss-org/ui/theming/colors'
import _ from 'lodash'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks/useBlocks'
import { Embed, BlockType } from '@databyss-org/services/interfaces/Block'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { IframeAttributes } from './Suggest/SuggestEmbeds'
import { showAtomicModal } from '../lib/atomicModal'
import { useEditorContext } from '../state/EditorProvider'
import { useNavigationContext } from '../../databyss-ui/components/Navigation/NavigationProvider/NavigationProvider'

export const EmbedMedia = ({
  _children,
  attributes,
  _element,
  onInlineClick,
}) => {
  const editorContext = useEditorContext()
  const editor = useEditor()
  const navigationContext = useNavigationContext()
  const blocksRes = useBlocks(BlockType.Embed)
  const [data, setData] = useState<null | Embed>()

  useEffect(() => {
    if (blocksRes.status === 'success') {
      // load attributes
      const _data = blocksRes.data[_element.atomicId] as Embed
      if (_data && !_.isEqual(_data, data)) {
        setData(_data)
      }
    }
  }, [blocksRes])

  const { gray } = colors

  // const showModal = (e) => {
  //   e.preventDefault()

  //   const modalData = {
  //     editorContextRef,
  //     editorContext,
  //     editor,
  //     navigationContext,
  //     inlineAtomicData,
  //   }
  //   showAtomicModal(modalData)
  // }

  const IFrame = () => {
    if (!data) {
      return null
    }
    const _atts: IframeAttributes = {
      width: data.detail.dimensions.width,
      height: data.detail.dimensions.height,
      src: data.detail.src,
      title: data.detail.title,
    }
    return (
      <View position="relative" id="testing" width={_atts.width}>
        <View position="relative" zIndex={1}>
          <iframe
            id={_element.atomicId}
            title={_atts.title}
            // border="0px"
            frameBorder="0px"
            {..._atts}
          />
        </View>
        <View
          zIndex={2}
          position="absolute"
          top="small"
          right="small"
          borderRadius="default"
          backgroundColor={gray[6]}
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
          position: 'relative',
          display: 'block',
          borderRadius: '3px',
          //    padding: '3px',
        }}
      >
        <span
          contentEditable={false}
          id="inline-embed-input"
          style={{
            position: 'relative',
            // change  this back to a high number
            zIndex: 0,
            display: 'block',
            // backgroundColor: gray[6],
            borderRadius: '3px',
            // height: '300px',
            //    padding: '3px',
          }}
        >
          {data ? <IFrame /> : <LoadingFallback />}
        </span>
        <span
          style={{
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
    [data]
  )
}
