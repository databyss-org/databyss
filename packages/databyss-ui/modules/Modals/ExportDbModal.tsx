import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { setTopic } from '@databyss-org/services/topics'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  Button,
  List,
  ModalWindow,
  Text,
  View,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useExportContext } from '@databyss-org/services/export'
import { ExportContextType } from '@databyss-org/services/export/ExportProvider'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { DropdownMenu } from '../../components/Menu/DropdownMenu'
import { MenuItem } from '../../components/Menu/DropdownList'
import { PathTokens } from '../../components/Navigation/NavigationProvider/interfaces'
import { LoadingFallback } from '../../components'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

export interface ExportDbOptions {
  include: 'everything' | 'bibliography' | 'citation' | 'author' | 'page'
  format: 'obsidian' | 'databyss'
  action: 'open' | 'save'
}

export const ExportDbModal = ({
  visible,
  onExportComplete,
  onCancel,
}: {
  visible: boolean
  onExportComplete?: () => void
  onCancel?: () => void
}) => {
  const [exporting, setExporting] = useState<boolean>(false)
  const [values, setValues] = useState<ExportDbOptions>({
    format: 'databyss',
    include: 'everything',
    action: eapi.isWeb ? 'open' : 'save',
  })
  const [showAppLink, setShowAppLink] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string>(
    'Preparing your export…'
  )
  const {
    exportDatabase,
    exportAllPages,
    exportSinglePage,
    exportBibliography,
  } = useExportContext() as ExportContextType
  const hideModal = useNavigationContext((c) => c && c.hideModal)
  const getTokensFromPath = useNavigationContext(
    (c) => c && c.getTokensFromPath
  )
  const path: PathTokens = getTokensFromPath()

  const onDismiss = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
    hideModal()
  }, [onCancel, hideModal])

  // TODO: consider using a protocol detection lib like
  // https://github.com/vireshshah/custom-protocol-check

  const onSubmit = useCallback(async () => {
    setShowAppLink(false)
    setTimeout(() => {
      setExporting(true)
    }, 250)

    if (values.format === 'databyss') {
      if (values.action === 'save') {
        await exportDatabase()
        hideModal()
        return
      }
      window.setTimeout(() => {
        hideModal()
      }, 30000)
      window.setTimeout(() => {
        setStatusMessage('Launching Databyss…')
        setShowAppLink(true)
      }, 1000)

      window.open(`databyss://import/${dbRef.groupId}`, '_self')
    } else {
      switch (values.include) {
        case 'everything':
          await exportAllPages()
          break
        case 'bibliography':
          await exportBibliography({})
          break
        case 'author':
          await exportBibliography({ author: path.author })
          break
        case 'citation':
          await exportBibliography({
            author: path.author,
            sourceId: path.params,
          })
          break
        case 'page':
          await exportSinglePage(path.params)
          break
      }
      hideModal()
    }
    if (onExportComplete) {
      onExportComplete()
    }
  }, [
    values,
    setShowAppLink,
    setExporting,
    exportDatabase,
    exportAllPages,
    exportBibliography,
    onExportComplete,
    hideModal,
  ])

  const _formatMenuItems: MenuItem[] = [
    {
      label: 'Databyss',
      value: 'databyss',
    },
    {
      label: 'Markdown (Obsidian)',
      value: 'obsidian',
    },
  ]

  const _actionMenuItems: MenuItem[] = [
    {
      label: 'My Databyss',
      value: 'open',
    },
    {
      label: 'ZIP file',
      value: 'save',
    },
  ]

  const _includeMenuItems: MenuItem[] = [
    {
      label: 'Everything',
      value: 'everything',
    },
  ]
  if (values.format === 'obsidian') {
    _includeMenuItems.push({
      label: 'Bibliograpy',
      value: 'bibliography',
    })
    if (path.type === 'pages') {
      _includeMenuItems.push({
        label: 'Current Page',
        value: 'page',
      })
    }
    if (path.type === 'sources' && path.author) {
      _includeMenuItems.push({
        label: 'Bibliography (current author)',
        value: 'author',
      })
    }
    if (path.type === 'sources' && path.params) {
      _includeMenuItems.push({
        label: 'Current citation',
        value: 'citation',
      })
    }
  }

  if (values.format === 'databyss') {
    values.include = 'everything'
  }

  let _actionButtonLabel = eapi.isWeb ? 'Download' : 'Save'
  if (values.format === 'databyss' && values.action === 'open') {
    _actionButtonLabel = 'Open in Databyss'
  }

  const _appLinkView = (
    <View px="em" mb="medium">
      <Text variant="uiTextNormal" mb="small">
        If Databyss doesn&#39;t launch, please download the app, open it, and
        try again.
      </Text>
      <Button variant="uiLink" href="https://databyss.org" target="_blank">
        Download Databyss
      </Button>
    </View>
  )

  const _confirmButtonsView = (
    <View flexDirection="row" justifyContent="space-between" px="em">
      <View flexDirection="row" alignItems="center">
        {exporting && (
          <>
            <LoadingFallback />
            <Text variant="uiTextNormal" color="text.3" ml="tiny">
              {statusMessage}
            </Text>
          </>
        )}
      </View>
      {showAppLink ? (
        <Button variant="primaryUiSmall" onPress={onDismiss}>
          Done
        </Button>
      ) : (
        <View flexDirection="row">
          <Button variant="uiTextButton" mr="small" onPress={onDismiss}>
            Cancel
          </Button>
          {!exporting && (
            <Button variant="primaryUiSmall" onPress={onSubmit}>
              {_actionButtonLabel}
            </Button>
          )}
        </View>
      )}
    </View>
  )

  const _includeView = (
    <View flexDirection="row" alignItems="center">
      <Text variant="uiTextNormal" color="text.3">
        Include
      </Text>
      <View flexGrow={1} flexShrink={1} overflow="hidden">
        <View
          alignSelf="flex-end"
          justifyContent="right"
          flexDirection="row"
          alignItems="center"
          maxWidth="80%"
        >
          <ValueListItem path="include" dependencies={[exporting]}>
            <DropdownMenu
              menuItems={_includeMenuItems}
              menuViewProps={{ justifyContent: 'right' }}
              disabled={exporting}
            />
          </ValueListItem>
        </View>
      </View>
    </View>
  )

  const _formatView = (
    <View flexDirection="row" alignItems="center">
      <Text variant="uiTextNormal" color="text.3">
        Format
      </Text>
      <View flexGrow={1} flexShrink={1} overflow="hidden">
        <View
          alignSelf="flex-end"
          justifyContent="right"
          flexDirection="row"
          alignItems="center"
          maxWidth="80%"
        >
          <ValueListItem path="format" dependencies={[exporting]}>
            <DropdownMenu
              menuItems={_formatMenuItems}
              menuViewProps={{ justifyContent: 'right' }}
              disabled={exporting}
            />
          </ValueListItem>
        </View>
      </View>
    </View>
  )

  const _actionView = (
    <View flexDirection="row" alignItems="center">
      <Text variant="uiTextNormal" color="text.3">
        Share to
      </Text>
      <View flexGrow={1} flexShrink={1} overflow="hidden">
        <View
          alignSelf="flex-end"
          justifyContent="right"
          flexDirection="row"
          alignItems="center"
          maxWidth="80%"
        >
          <ValueListItem path="action" dependencies={[exporting]}>
            <DropdownMenu
              menuItems={_actionMenuItems}
              menuViewProps={{ justifyContent: 'right' }}
              disabled={exporting}
            />
          </ValueListItem>
        </View>
      </View>
    </View>
  )

  return (
    <ModalWindow
      visible={visible}
      widthVariant="dialog"
      onDismiss={onDismiss}
      // dismissChild="done"
      canDismiss
      px="none"
      pt="none"
    >
      <ValueListProvider onChange={setValues} values={values}>
        <View paddingVariant="none" backgroundColor="background.0" width="100%">
          <List horizontalItemPadding="em" verticalItemPadding="small">
            {_formatView}
            {values.format === 'databyss' && eapi.isWeb && _actionView}
            {values.format === 'obsidian' && _includeView}
          </List>
          {showAppLink && _appLinkView}
          {_confirmButtonsView}
        </View>
      </ValueListProvider>
    </ModalWindow>
  )
}
