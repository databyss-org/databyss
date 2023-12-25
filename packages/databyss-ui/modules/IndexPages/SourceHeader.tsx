import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BlockType, Embed, Source } from '@databyss-org/services/interfaces'
import { textToHtml } from '@databyss-org/services/blocks'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import {
  fetchAnnotations,
  fileIsPDF,
  queryMetadataFromCatalog,
} from '@databyss-org/services/pdf'
import { uploadEmbed } from '@databyss-org/services/embeds'
import { setSource } from '@databyss-org/services/sources'
import { Button, RawHtml, Text, View, Icon } from '../..'
import { LoadingFallback } from '../../components'
import { FileDropZone } from '../../components/DropZone/FileDropZone'
import { DList } from '../../components/DynamicList/DList'
import { MenuItem } from '../../components/Menu/DropdownList'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

const SourceTitleAndCitationView = ({ source }: { source: Source }) =>
  source ? (
    <Text variant="uiTextNormal" mb="small" color="text.2">
      <RawHtml html={textToHtml(source.text)} />
    </Text>
  ) : null

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
      action: (idx: string) => {
        const _embed = blocksRes.data[sourceRef.current.media![idx]] as Embed
        eapi.file.openNative(
          _embed.detail.src.split('/').slice(0, -1).join('/')
        )
        return true
      },
    },
    {
      label: 'Delete',
      action: async (idx: string) => {
        const _embedId = sourceRef.current.media![idx]
        console.log('[SourceHeader] delete', _embedId)
        await eapi.file.deleteMedia(_embedId)
        await setSource({
          ...sourceRef.current,
          media: sourceRef.current.media?.filter((id) => id !== _embedId),
        })
        return true
      },
    },
  ]
  return (
    <DList
      alignItems="flex-start"
      menuItems={menuItems}
      menuViewProps={{
        left: 'mediumNegative',
      }}
      dropdownContainerProps={{
        position: {
          top: '20px',
        },
      }}
      horizontalItemMargin={0}
      horizontalItemPadding={0}
    >
      {source.media!.map((id) => {
        const _embed = blocksRes.data[id] as Embed
        if (!_embed) {
          return null
        }
        return (
          <Button
            key={_embed._id}
            variant="uiLink"
            href={_embed.detail.src}
            target="_blank"
            hoverColor="transparent"
            textVariant="uiTextSmall"
            onPress={() => {
              eapi.file.openNative(_embed.detail.src)
            }}
          >
            {_embed.detail.fileDetail?.filename}
          </Button>
        )
      })}
    </DList>
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
    if (fileIsPDF(file)) {
      const _pdfResults = await fetchAnnotations(file)
      // console.log('[SourceHeader] PDF results', _pdfResults)
      if (_pdfResults?.metadata?.title) {
        _filename = _pdfResults.metadata.title.text
      }
    }
    console.log('[SourceHeader] filename', _filename)
    const _embed: Embed = await uploadEmbed(file, _filename)
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
