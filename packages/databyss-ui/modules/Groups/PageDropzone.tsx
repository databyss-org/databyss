import React, { useCallback } from 'react'
import {
  DraggableItem,
  Text,
  View,
  List,
  ScrollView,
  ScrollViewProps,
  Icon,
  BaseControl,
  Separator,
} from '@databyss-org/ui/primitives'
import { PageHeader } from '@databyss-org/services/interfaces'
import { LoadingFallback, SidebarListRow } from '@databyss-org/ui/components'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { usePages } from '@databyss-org/data/pouchdb/hooks'

interface PageDropzoneProps extends ScrollViewProps {
  value?: string[]
  onChange?: (value: string[]) => void
}

export const PageDropzone = ({
  value,
  onChange,
  ...others
}: PageDropzoneProps) => {
  const pagesRes = usePages()

  const onDrop = useCallback(
    (item: DraggableItem) => {
      const _pageHeader = item.payload as PageHeader
      onChange!(value!.concat(_pageHeader._id))
    },
    [onChange]
  )
  const onRemove = (_id: string) => {
    onChange!(value!.filter((p) => p !== _id))
  }

  if (!pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={pagesRes} />
  }

  const _pageHeaders = value!.map((pageId) => pagesRes.data![pageId])

  const _sortedItems: PageHeader[] = sortEntriesAtoZ(_pageHeaders, 'name')

  return (
    <ScrollView shadowOnScroll borderRadius="default" {...others}>
      <List
        height="100%"
        dropzone={{
          accepts: 'PAGE',
          onDrop,
        }}
        py="small"
      >
        {value!.length ? (
          <>
            {_sortedItems.map((page: PageHeader) => (
              <SidebarListRow
                key={page._id}
                text={page.name}
                isActive
                icon={<PageSvg />}
                hoverColor="control.1"
                p="em"
              >
                <BaseControl onPress={() => onRemove(page._id)}>
                  <Icon sizeVariant="tiny">
                    <CloseSvg />
                  </Icon>
                </BaseControl>
              </SidebarListRow>
            ))}
            {value!.length === 1 && (
              <>
                <View px="em" pt="none">
                  <Separator spacing="small" color="text.3" />
                  <View mr="small">
                    <Text
                      variant="uiTextSmall"
                      mb="em"
                      mt="small"
                      color="text.2"
                    >
                      To remove a page from this collection, click the ‘X’.
                    </Text>
                    <Text variant="uiTextSmall" color="text.2">
                      This will not remove it from its original collection.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </>
        ) : (
          <View pl="em" pr="medium" py="small">
            <Text variant="uiTextSmall" mb="em" color="text.2">
              Drag pages here from the sidebar to add them to this collection.
            </Text>
            <Text variant="uiTextSmall" color="text.2">
              Note that this does not remove them from their original
              collections.
            </Text>
          </View>
        )}
      </List>
    </ScrollView>
  )
}
