import React, { useState } from 'react'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
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
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import {
  LoadingFallback,
  SidebarListRow,
  DropdownContainer,
} from '@databyss-org/ui/components'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { addPageDocumentToGroup } from '@databyss-org/data/pouchdb/groups'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
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
  const _inTestEnv = process.env.NODE_ENV === 'test'
  const [showMenu, setShowMenu] = useState(false)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)

  let _pagesList

  if (pages) {
    const addPage = (item) => {
      setShowMenu(false)
      const _id = item._id
      onChange!(value!.concat(_id))
      addPageDocumentToGroup({ pageId: _id, group })
    }

    const _sorted = sortEntriesAtoZ(Object.values(pages), 'name')

    const _children = _sorted.map((p: any) => (
      <DropdownListItem
        key={p._id}
        data-test-element="dropdown-pages"
        px="small"
        justifyContent="center"
        label={p.name}
        onPress={() => addPage(p)}
        action="addPage"
      />
    ))

    _pagesList = (
      <View pl="small" justifyContent="center" position="relative">
        <BaseControl
          onPress={() => setShowMenu(!showMenu)}
          data-test-element="add-page-to-collection"
        >
          <Text>Add Page +</Text>
        </BaseControl>
        <DropdownContainer
          p="tiny"
          open={showMenu}
          children={_children}
          position={{
            top: menuLauncherSize + 8,
          }}
        />
      </View>
    )
  }

  // get most current group and page value

  const onDrop = (item: DraggableItem) => {
    if (isReadOnly) {
      return
    }
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
        horizontalItemPadding="em"
        verticalItemPadding="small"
        py="small"
      >
        {_inTestEnv ? _pagesList : null}

        {value!.length ? (
          <>
            {_sortedItems.map((page: PageHeader) => (
              <SidebarListRow
                key={page._id}
                text={page.name}
                isActive
                icon={<PageSvg />}
                hoverColor="control.1"
                // p="em"
              >
                {!isReadOnly && (
                  <BaseControl
                    onPress={() => onRemove(page._id)}
                    data-test-element="remove-page"
                  >
                    <Icon sizeVariant="tiny">
                      <CloseSvg />
                    </Icon>
                  </BaseControl>
                )}
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
            <Text
              data-test-element="drop-zone"
              variant="uiTextSmall"
              color="text.2"
            >
              Note that this does not remove them from their original
              collections.
            </Text>
          </View>
        )}
      </List>
    </ScrollView>
  )
}
