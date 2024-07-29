import React, { ReactNode, useState } from 'react'
import {
  View,
  List,
  SwitchControl,
  Text,
  Separator,
  BaseControl,
  BaseControlProps,
  Icon,
  Grid,
  Button,
} from '@databyss-org/ui/primitives'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import CheckSvg from '@databyss-org/ui/assets/check.svg'
import { Group, Page } from '@databyss-org/services/interfaces'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvider'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { MenuItem } from '../../components/Menu/DropdownList'
import { DropdownMenu } from '../../components/Menu/DropdownMenu'
import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { ValueListItem } from '../../components/ValueList/ValueListProvider'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { copyToClipboard } from '../../components/PageContent/PageMenu'

interface IconControlProps extends BaseControlProps {
  icon: ReactNode
  label: string
  color: string
  iconColor?: string
}

export const IconControl = ({
  icon,
  label,
  color,
  iconColor,
  ...others
}: IconControlProps) => (
  <BaseControl
    childViewProps={{ flexDirection: 'row', alignItems: 'center' }}
    {...others}
  >
    <View flexGrow={1}>
      <Text variant="uiTextNormal" color={color}>
        {label}
      </Text>
    </View>
    <Icon sizeVariant="small" mr="small" color={iconColor ?? color}>
      {icon}
    </Icon>
  </BaseControl>
)

interface PublicSharingSettingsProps {
  value?: boolean
  onChange?: (value: boolean) => void
  readOnly?: boolean
  group: Group
}

export const PublicSharingSettings = ({
  group,
  readOnly,
  ...others
}: PublicSharingSettingsProps) => {
  const [linkCopied, setLinkCopied] = useState(false)
  const publishGroupDatabase = useDatabaseContext(
    (c) => c && c.publishGroupDatabase
  )
  const pagesRes = usePages()

  let _lastPublishedText = 'never'
  if (group.isPublishing) {
    _lastPublishedText = 'publishing'
  } else if (group.lastPublishedAt) {
    const _date = new Date(group.lastPublishedAt)
    _lastPublishedText = `${_date.toDateString()} ${_date.getHours()}:${_date.getMinutes()}:${_date.getSeconds()}`
  }

  let _defaultPage: Page | null = null
  let _defaultPageMenuItems: MenuItem[] = []
  if (pagesRes.data) {
    _defaultPage = pagesRes.data[group.defaultPageId ?? group.pages[0]]

    _defaultPageMenuItems = group.pages.map((pid) => {
      const _page = pagesRes.data[pid]
      return {
        label: _page.name,
        icon: null,
        value: _page._id,
      }
    })
  }

  const copyLink = () => {
    // TODO: collection should only be linkable if page exist

    // compose public link
    const getUrl = window.location
    const _groupName = group.name ? `${urlSafeName(group.name)}-` : ''
    const baseUrl = `${getUrl.protocol}//${
      getUrl.host
    }/${_groupName}${group._id.substring(2)}`

    copyToClipboard(baseUrl)
  }

  const _defaultPageView = _defaultPage && (
    <>
      <View px="em">
        <Separator spacing="none" color="text.3" />
      </View>
      <View flexDirection="row" alignItems="center">
        <View flexShrink={0} mr="small">
          <Text variant="uiTextNormal" color="text.2">
            Default page
          </Text>
        </View>
        <View flexGrow={1} flexShrink={1} overflow="hidden">
          <View
            alignSelf="flex-end"
            justifyContent="right"
            flexDirection="row"
            alignItems="center"
            maxWidth="80%"
          >
            <ValueListItem path="defaultPageId">
              <DropdownMenu
                renderLabel={(_pageId) =>
                  (pagesRes.data && pagesRes.data[_pageId]?.name) ?? '?'
                }
                menuItems={_defaultPageMenuItems}
                width="100%"
                menuViewProps={{ justifyContent: 'right' }}
              />
            </ValueListItem>
          </View>
        </View>
      </View>
    </>
  )

  const _lastPublishedView = (
    <>
      <View px="em">
        <Separator spacing="none" color="text.3" />
      </View>
      <Grid>
        <View>
          <Text variant="uiTextNormal" color="text.2">
            Last published:
          </Text>
          <Text variant="uiTextNormal" color="text.2">
            {_lastPublishedText}
          </Text>
        </View>
        <View flexGrow={1}>
          <Button
            variant="uiLinkPadded"
            alignSelf="flex-end"
            onPress={() => {
              publishGroupDatabase(group)
            }}
          >
            {group.isPublishing ? 'Cancel' : 'Publish now'}
          </Button>
        </View>
      </Grid>
    </>
  )

  const _copyLinkView = group.lastPublishedAt && (
    <>
      <View px="em">
        <Separator spacing="none" color="text.3" />
      </View>
      <IconControl
        data-test-element="copy-link"
        onClick={() => {
          copyLink()
          setLinkCopied(true)
        }}
        icon={linkCopied ? <CheckSvg /> : <LinkSvg />}
        iconColor={linkCopied ? 'green.0' : 'text.2'}
        color="text.2"
        label={linkCopied ? 'Link copied' : 'Copy link'}
      />
    </>
  )

  const _publicSwitchView = (
    <ValueListItem path="public">
      <SwitchControl
        label="Publish collection as website"
        data-test-element="group-public"
        alignLabel="left"
        textVariant="uiTextNormal"
        labelTextProps={{
          color: 'text.2',
        }}
        disabled={readOnly}
      />
    </ValueListItem>
  )

  return (
    <List
      bg="background.2"
      horizontalItemPadding="em"
      verticalItemPadding="small"
      borderRadius="default"
      {...others}
    >
      {_publicSwitchView}
      {group.public && (
        <>
          {_defaultPageView}
          {_lastPublishedView}
          {_copyLinkView}
        </>
      )}
    </List>
  )
}
