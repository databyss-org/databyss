import React, { useState } from 'react'
import { menuLauncherSize } from '@databyss-org/ui/theming/buttons'
import RemoveSvg from '@databyss-org/ui/assets/trash.svg'
import HomeSvg from '@databyss-org/ui/assets/home.svg'
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
  SidebarListItem,
  useNavigationContext,
} from '@databyss-org/ui/components'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  addPageDocumentToGroup,
  setGroup,
} from '@databyss-org/data/pouchdb/groups'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import {
  setGroupPageAction,
  PageAction,
} from '@databyss-org/data/pouchdb/groups/utils'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { maxWidth } from 'styled-system'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { MenuItem } from '@databyss-org/ui/components/Menu/DropdownList'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'

interface PageDropzoneProps extends ScrollViewProps {
  value?: string[]
  pages: DocumentDict<Page> | undefined
  onChange?: (value: string[]) => void
  group: Group
  defaultPageId: string
  readOnly: boolean
}

export const PageDropzone = ({
  value,
  pages,
  group,
  onChange,
  defaultPageId,
  readOnly,
  ...others
}: PageDropzoneProps) => {
  const _inTestEnv = process.env.NODE_ENV === 'test'
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigationContext((c) => c.navigate)
  const notifyConfirm = useNotifyContext((c) => c.notifyConfirm)

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
    if (readOnly) {
      notifyConfirm({
        message:
          'Cannot add pages to or remove pages from an imported collection',
        showCancelButton: false,
      })
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
    // do not allow duplicates
    if (value.includes(_id)) {
      return
    }
    onChange!(value!.concat(_id))
    addPageDocumentToGroup({ pageId: _id, group })
  }

  const onRemove = (_id: string) => {
    if (readOnly) {
      notifyConfirm({
        message:
          'Cannot add pages to or remove pages from an imported collection',
        showCancelButton: false,
      })
      return
    }
    if (!group || !pages) {
      return
    }
    const _pageToRemove = pages[_id]
    setGroupPageAction(group._id, _pageToRemove._id, PageAction.REMOVE)

    const _nextValue = value!.filter((p) => p !== _id)

    onChange!(_nextValue)
  }

  const onSetDefaultPage = async (_id: string) => {
    if (!group) {
      return
    }
    const _nextGroup = { ...group }
    _nextGroup.defaultPageId = _id
    await setGroup(_nextGroup)
    onChange!(value)
  }

  if (!pages || !group) {
    return <LoadingFallback />
  }

  const _pageHeaders = value!.map((pageId) => pages![pageId])

  const _sortedItems: PageHeader[] = sortEntriesAtoZ(
    _pageHeaders,
    'name',
    (entry: Page) => entry._id === defaultPageId
  )

  const pageMenuItems = (page: PageHeader) => {
    const _menuItems: MenuItem[] = [
      {
        label: 'Set as default',
        icon: <HomeSvg />,
        action: () => {
          onSetDefaultPage(page._id)
          return true
        },
      },
      {
        label: 'Remove from collection',
        icon: <RemoveSvg />,
        action: () => {
          onRemove(page._id)
          return true
        },
      },
    ]
    return _menuItems
  }

  return (
    <List
      dropzone={{
        accepts: 'PAGE',
        onDrop,
      }}
      horizontalItemPadding="none"
      px="none"
      verticalItemPadding="small"
      py="none"
      {...others}
    >
      {_inTestEnv ? _pagesList : null}

      {value!.length ? (
        <>
          {_sortedItems.map((page: PageHeader, idx) => (
            <SidebarListItem
              contextMenu={readOnly ? undefined : pageMenuItems(page)}
              key={page._id}
              text={page.name}
              // isActive
              icon={<PageSvg />}
              // hoverColor="control.1"
              pl="tiny"
              pr="small"
              borderBottomColor="border.2"
              borderBottomWidth={1}
              borderBottomStyle="solid"
              onPress={() => {
                navigate(`/pages/${page._id}/${urlSafeName(page.name)}`)
              }}
              textProps={{
                maxWidth: pxUnits(350),
                ...(defaultPageId === page._id ? { color: 'purple.1' } : {}),
              }}
            />
          ))}
        </>
      ) : (
        <View pr="medium" py="em" flexShrink={1}>
          <Text variant="uiTextNormal" color="text.3" flexShrink={1}>
            Drag pages here from the sidebar to add them to this collection.
          </Text>
        </View>
      )}
    </List>
  )
}
