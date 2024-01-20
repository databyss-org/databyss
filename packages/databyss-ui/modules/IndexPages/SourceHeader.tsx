import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { BlockType, Embed, Source } from '@databyss-org/services/interfaces'
import { mergeRanges, textToHtml } from '@databyss-org/services/blocks'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { fileIsPDF, processPDF } from '@databyss-org/services/pdf'
import { uploadEmbed } from '@databyss-org/services/embeds'
import { setSource } from '@databyss-org/services/sources'
import { createHighlightRanges } from '@databyss-org/editor/lib/util'
import {
  SortOptions,
  splitOverlappingRanges,
} from '@databyss-org/services/blocks/textRanges'
import { Button, RawHtml, Text, View, Icon, List, BaseControl } from '../..'
import { LoadingFallback } from '../../components'
import { FileDropZone } from '../../components/DropZone/FileDropZone'
import { MenuItem } from '../../components/Menu/DropdownList'
import { useSearchContext } from '../../hooks'
import { ContextMenu } from '../../components/Menu/ContextMenu'
import TrashSvg from '../../assets/trash.svg'
import FolderSvg from '../../assets/folder-open.svg'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

const SourceTitleAndCitationView = ({ source }: { source: Source }) => {
  const searchTerms = useSearchContext((c) => c && c.normalizedStemmedTerms)
  if (!source) {
    return null
  }
  const _highlightRanges = createHighlightRanges(
    source.text.textValue,
    searchTerms
  )
  let _ranges = [...source.text.ranges, ..._highlightRanges]
  _ranges = mergeRanges(_ranges, SortOptions.Ascending)
  splitOverlappingRanges(_ranges)
  return (
    <Text variant="uiTextNormal" mb="small" color="text.2">
      <RawHtml
        html={textToHtml({
          textValue: source.text.textValue,
          ranges: _ranges,
        })}
      />
    </Text>
  )
}

export const MediaLinkItem = ({ menuItems, embed }) => {
  const controlRef = useRef() as MutableRefObject<HTMLElement>
  return (
    <BaseControl
      href={embed.detail.src}
      target="_blank"
      hoverColor="transparent"
      position="relative"
      childViewProps={{
        justifyContent: 'center',
      }}
      focusVisible
      focusActive
      onPress={() => {
        console.log('[SourceHeader] openNative', embed.detail.src)
        eapi.file.openNative(embed.detail.src)
      }}
      ref={controlRef}
    >
      <ContextMenu
        data={embed}
        menuItems={menuItems}
        menuViewProps={{
          position: 'absolute',
          left: 'mediumNegative',
        }}
        menuActivatorProps={{
          left: 'mediumNegative',
        }}
        parentRef={controlRef}
      />
      <Text
        variant="uiTextSmall"
        color="blue.2"
        css={{ textDecoration: 'underline' }}
        m="tiny"
      >
        {embed.detail.fileDetail?.filename}
      </Text>
    </BaseControl>
  )
}

export const MediaLinks = ({ source }: { source: Source }) => {
  const sourceRef = useRef(source)
  useEffect(() => {
    sourceRef.current = source
  }, [source])
  const blocksRes = useBlocks(BlockType.Embed)
  if (!blocksRes.isSuccess) {
    return <LoadingFallback queryObserver={blocksRes} />
  }
  const menuItems: MenuItem[] = [
    {
      label: 'Open file location',
      icon: <FolderSvg />,
      action: (embed: Embed) => {
        // const _embed = blocksRes.data[sourceRef.current.media![idx]] as Embed
        eapi.file.openNative(embed.detail.src.split('/').slice(0, -1).join('/'))
        return true
      },
    },
    {
      label: 'Delete',
      icon: <TrashSvg />,
      action: async (embed: Embed) => {
        // const _embedId = sourceRef.current.media![idx]
        console.log('[SourceHeader] delete', embed._id)
        await eapi.file.deleteMedia(embed._id)
        await setSource({
          ...sourceRef.current,
          media: sourceRef.current.media?.filter((id) => id !== embed._id),
        })
        return true
      },
    },
  ]
  return (
    <List
      alignItems="flex-start"
      horizontalItemMargin={0}
      horizontalItemPadding={0}
      verticalItemMargin={0}
      verticalItemPadding={0}
    >
      {source.media!.map((id) => {
        const _embed = blocksRes.data[id] as Embed
        if (!_embed) {
          return null
        }
        return (
          <MediaLinkItem
            key={_embed._id}
            menuItems={menuItems}
            embed={_embed}
          />
        )
      })}
    </List>
  )
}

export const SourceHeader = ({
  source,
  readOnly,
  onPressDetails,
}: {
  source: Source
  readOnly: boolean
  onPressDetails: () => void
}) => {
  const [isBusy, setIsBusy] = useState(false)
  const sourceRef = useRef(source)
  useEffect(() => {
    sourceRef.current = source
  }, [source])
  const onFileDropped = async (file: File) => {
    // console.log('[SourceHeader] file', file)
    setIsBusy(true)
    let _filename = file.name
    let _embed: Embed
    if (fileIsPDF(file)) {
      const _processResults = await processPDF(file)
      _filename = _processResults.embed.detail.fileDetail!.filename
      _embed = _processResults.embed
    } else {
      _embed = await uploadEmbed(file, _filename)
    }
    console.log('[SourceHeader] filename', _filename)
    await setSource({
      ...sourceRef.current,
      media: [...(sourceRef.current.media ?? []), _embed._id],
    })
    setIsBusy(false)
  }
  return readOnly ? (
    <SourceTitleAndCitationView source={source} />
  ) : (
    <View mt="em">
      <FileDropZone onFile={onFileDropped} isBusy={isBusy} />
      <SourceTitleAndCitationView source={source} />
      <Button
        onPress={onPressDetails}
        variant="uiTextButtonShaded"
        alignSelf="flex-start"
        childViewProps={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
        mt="small"
      >
        <Icon
          data-test-button="open-source-modal"
          color="gray.3"
          sizeVariant="tiny"
          pr="tiny"
        >
          <EditSvg />
        </Icon>
        <Text variant="uiTextSmall" color="gray.3">
          View/Edit Citation
        </Text>
      </Button>
      <View mt="medium">
        <Text variant="uiTextHeading" mb="small">
          Media
        </Text>
        {source.media?.length ? (
          <MediaLinks source={source} />
        ) : (
          <Text variant="uiTextSmall" color="text.3">
            Drag files here to add media (PDFs, images, etc.)
          </Text>
        )}
      </View>
    </View>
  )
}
