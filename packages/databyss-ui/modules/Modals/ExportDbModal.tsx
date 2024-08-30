import React, { useState } from 'react'
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
import { DropdownMenu } from '../../components/Menu/DropdownMenu'
import { MenuItem } from '../../components/Menu/DropdownList'
import { PathTokens } from '../../components/Navigation/NavigationProvider/interfaces'
import { LoadingFallback } from '../../components'
import { ExportContextType } from '@databyss-org/services/export/ExportProvider'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'

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
    action: 'open',
  })
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

  const onDismiss = () => {
    if (onCancel) {
      onCancel()
    }
    hideModal()
  }

  const onSubmit = async () => {
    setTimeout(() => {
      setExporting(true)
    }, 500)

    if (values.format === 'databyss') {
      if (values.action === 'save') {
        await exportDatabase()
      } else {
        window.open(`databyss://import/${dbRef.groupId}`, '_self')
      }
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
    }

    setExporting(false)

    if (onExportComplete) {
      onExportComplete()
    }
    // hideModal()
  }

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
      label: 'Import into my Databyss',
      value: 'open',
    },
    {
      label: 'Download as ZIP file',
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

  const _confirmButtonsView = (
    <>
      <View flexDirection="row" justifyContent="space-between" px="em">
        <View flexDirection="row" alignItems="center">
          {exporting && (
            <>
              <LoadingFallback />
              <Text variant="uiTextNormal" color="text.3" ml="tiny">
                Preparing your export…
              </Text>
            </>
          )}
        </View>
        <View flexDirection="row">
          <Button variant="uiTextButton" mr="small" onPress={onDismiss}>
            Cancel
          </Button>
          {!exporting && (
            <Button variant="primaryUiSmall" onPress={onSubmit}>
              Export
            </Button>
          )}
        </View>
      </View>
    </>
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
        After export
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
            {values.format === 'databyss' && _actionView}
            {values.format === 'obsidian' && _includeView}
          </List>
          {_confirmButtonsView}
        </View>
      </ValueListProvider>
    </ModalWindow>
  )
}
