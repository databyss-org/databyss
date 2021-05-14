import React, { useEffect, useState } from 'react'
import colors from '@databyss-org/ui/theming/colors'
import { useBlocks } from '../../databyss-data/pouchdb/hooks/useBlocks'
import { Embed } from '../../databyss-services/interfaces/Block'
import LoadingFallback from '../../databyss-ui/components/Notify/LoadingFallback'
import { IframeAttributes } from './Suggest/SuggestEmbeds'

export const EmbedMedia = ({ _children, attributes, _element }) => {
  const blocksRes = useBlocks('EMBED')
  const [data, setData] = useState<null | Embed>()
  console.log(blocksRes)

  useEffect(() => {
    if (blocksRes.status === 'success') {
      // load attributes
      const _data = blocksRes.data[_element.atomicId]
      if (blocksRes.data[_element.atomicId]) {
        setData(_data)
      }
    }
  }, [blocksRes.status])

  const { gray } = colors

  const IFrame = () => {
    if (!data) {
      return null
    }
    console.log(data)
    const _atts: IframeAttributes = {
      width: data.detail.dimensions.height,
      height: data.detail.dimensions.width,
      src: data.detail.src,
      title: data.detail.title,
    }
    return (
      <iframe
        id={_element.atomicId}
        title={_element.character}
        // border="0px"
        frameBorder="0px"
        {..._atts}
      />
    )
  }

  return (
    <span
      {...attributes}
      style={{
        display: 'block',
        borderRadius: '3px',
        //    padding: '3px',
      }}
    >
      <span contentEditable={false} id="inline-embed-input">
        {data ? <IFrame /> : <LoadingFallback />}
      </span>
      {_children}
    </span>
  )
}
