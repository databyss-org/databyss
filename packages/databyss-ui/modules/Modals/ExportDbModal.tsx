import React, { useCallback, useMemo, useState } from 'react'
import {
  Button,
  DropDownControl,
  List,
  ModalWindow,
  Text,
  View,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useExportContext } from '@databyss-org/services/export'
import { ExportContextType } from '@databyss-org/services/export/ExportProvider'
import { PathTokens } from '../../components/Navigation/NavigationProvider/interfaces'
import { LoadingFallback } from '../../components'

interface MenuOption {
  id: string
  label: string
}

interface ExportDbOptions {
  include: 'everything' | 'bibliography' | 'citation' | 'author' | 'page'
  format: 'obsidian' | 'databyss'
}

const toOption = (id: string, label: string): MenuOption => ({ id, label })

const formatOptions: MenuOption[] = [
  toOption('databyss', 'Databyss'),
  toOption('obsidian', 'Markdown (Obsidian)'),
]

export const ExportDbModal = ({
  visible,
  onExportComplete,
  onCancel,
}: {
  visible: boolean
  onExportComplete?: () => void
  onCancel?: () => void
}) => {
  const [exporting, setExporting] = useState(false)
  const [values, setValues] = useState<ExportDbOptions>({
    format: 'databyss',
    include: 'everything',
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

  const includeOptions: MenuOption[] = useMemo(() => {
    const options: MenuOption[] = [toOption('everything', 'Everything')]

    if (values.format === 'obsidian') {
      options.push(toOption('bibliography', 'Bibliography'))

      if (path.type === 'pages') {
        options.push(toOption('page', 'Current Page'))
      }
      if (path.type === 'sources' && path.author) {
        options.push(toOption('author', 'Bibliography (current author)'))
      }
      if (path.type === 'sources' && path.params) {
        options.push(toOption('citation', 'Current citation'))
      }
    }

    return options
  }, [values.format, path.type, path.author, path.params])

  const onDismiss = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
    hideModal()
  }, [hideModal, onCancel])

  const onSubmit = useCallback(async () => {
    setExporting(true)
    try {
      if (values.format === 'databyss') {
        await exportDatabase()
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

      if (onExportComplete) {
        onExportComplete()
      }
      hideModal()
    } finally {
      setExporting(false)
    }
  }, [
    values,
    exportDatabase,
    exportAllPages,
    exportSinglePage,
    exportBibliography,
    path.author,
    path.params,
    onExportComplete,
    hideModal,
  ])

  const selectedFormat =
    formatOptions.find((option) => option.id === values.format) ??
    formatOptions[0]

  const selectedInclude =
    includeOptions.find((option) => option.id === values.include) ??
    includeOptions[0]

  return (
    <ModalWindow
      visible={visible}
      widthVariant="dialog"
      onDismiss={onDismiss}
      canDismiss={!exporting}
      px="none"
      pt="none"
    >
      <View paddingVariant="none" backgroundColor="background.0" width="100%">
        <List horizontalItemPadding="em" verticalItemPadding="small">
          <View flexDirection="row" alignItems="center">
            <Text variant="uiTextNormal" color="text.3">
              Format
            </Text>
            <View flexGrow={1} />
            <DropDownControl
              items={formatOptions}
              value={selectedFormat}
              onChange={(item: MenuOption) =>
                setValues((current) => ({
                  ...current,
                  format: item.id as ExportDbOptions['format'],
                  include:
                    item.id === 'databyss' ? 'everything' : current.include,
                }))
              }
              disabled={exporting}
            />
          </View>

          {values.format === 'obsidian' && (
            <View flexDirection="row" alignItems="center">
              <Text variant="uiTextNormal" color="text.3">
                Include
              </Text>
              <View flexGrow={1} />
              <DropDownControl
                items={includeOptions}
                value={selectedInclude}
                onChange={(item: MenuOption) =>
                  setValues((current) => ({
                    ...current,
                    include: item.id as ExportDbOptions['include'],
                  }))
                }
                disabled={exporting}
              />
            </View>
          )}
        </List>

        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          px="em"
          pb="small"
        >
          <View>
            {exporting && (
              <View flexDirection="row" alignItems="center">
                <LoadingFallback />
                <Text variant="uiTextNormal" color="text.3" ml="tiny">
                  Preparing your export...
                </Text>
              </View>
            )}
          </View>
          <View flexDirection="row">
            <Button variant="uiTextButton" mr="small" onPress={onDismiss}>
              Cancel
            </Button>
            {!exporting && (
              <Button variant="primaryUi" onPress={onSubmit}>
                Download
              </Button>
            )}
          </View>
        </View>
      </View>
    </ModalWindow>
  )
}
