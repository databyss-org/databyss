import React, { useEffect, useState, useMemo } from 'react'
import colors from '@databyss-org/ui/theming/colors'
import _ from 'lodash'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks/useBlocks'
import { Embed, BlockType } from '@databyss-org/services/interfaces/Block'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { IframeAttributes } from './Suggest/SuggestEmbeds'

export const EmbedMedia = ({ _children, attributes, _element }) => {
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

  const IFrame = () => {
    if (!data) {
      return null
    }
    const _atts: IframeAttributes = {
      width: data.detail.dimensions.height,
      height: data.detail.dimensions.width,
      src: data.detail.src,
      title: data.detail.title,
    }
    return (
      <iframe
        id={_element.atomicId}
        title={_atts.title}
        // border="0px"
        frameBorder="0px"
        {..._atts}
      />
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
            backgroundColor: gray[6],
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
