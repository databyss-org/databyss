import React from 'react'
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
import {
  PageHeader,
  Page,
  Group,
  DocumentDict,
} from '@databyss-org/services/interfaces'
import { LoadingFallback, SidebarListRow } from '@databyss-org/ui/components'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { addPageDocumentToGroup } from '@databyss-org/data/pouchdb/groups'
import {
  setGroupPageAction,
  PageAction,
} from '@databyss-org/data/pouchdb/groups/utils'

interface PageDropzoneProps extends ScrollViewProps {
  value?: string[]
  pages: DocumentDict<Page> | undefined
  onChange?: (value: string[]) => void
  group: Group
}

export const PageDropzone = ({
  value,
  pages,
  group,
  onChange,
  ...others
}: PageDropzoneProps) => {
  // get most current group and page value

  const onDrop = (item: DraggableItem) => {
    if (!group) {
      return
    }

    // if item is being dragged from the `PUBLIC PAGES` section, get the public page id
    let _id
    if (item.payload.doctype === DocumentType.Group) {
      _id = item.payload._id.substring(2)
    } else {
      // do not allow archived pages
      if (item.payload?.archive) {
        return
      }

      const _pageHeader = item.payload as PageHeader
      _id = _pageHeader._id
    }
    onChange!(value!.concat(_id))
    addPageDocumentToGroup({ pageId: _id, group })
  }

  const onRemove = (_id: string) => {
    if (!group || !pages) {
      return
    }
    const _pageToRemove = pages[_id]
    setGroupPageAction(group._id, _pageToRemove._id, PageAction.REMOVE)

    const _nextValue = value!.filter((p) => p !== _id)

    // if page was default for the group, assign a new one
    if (_id === group.defaultPageId) {
      group.defaultPageId = _nextValue[0]
    }

    onChange!(_nextValue)
  }

  if (!pages || !group) {
    return <LoadingFallback />
  }

  const _pageHeaders = value!.map((pageId) => pages![pageId])

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
