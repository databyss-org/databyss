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
  Button,
} from '@databyss-org/ui/primitives'
import LinkSvg from '@databyss-org/ui/assets/copy.svg'
import CheckSvg from '@databyss-org/ui/assets/check.svg'
import LoadingSvg from '@databyss-org/ui/assets/loading.svg'
import { Group, Page } from '@databyss-org/services/interfaces'
import { usePublishingStatus } from '@databyss-org/desktop/src/hooks/usePublishingStatus'
import { useExportContext } from '@databyss-org/services/export'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { MenuItem } from '@databyss-org/ui/components/Menu/DropdownList'
import { DropdownMenu } from '@databyss-org/ui/components/Menu/DropdownMenu'
import { ValueListItem } from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { copyToClipboard } from '@databyss-org/ui/components/PageContent/PageMenu'
import { pxUnits } from '@databyss-org/ui/theming/views'

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
    <Text variant="uiTextNormal" color={color} mr="small">
      {label}
    </Text>
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
  const [showPublishLog, setShowPublishLog] = useState(group.isPublishing)
  const publishGroupDatabase = useExportContext(
    (c) => c && c.publishGroupDatabase
  )
  const cancelPublishGroupDatabase = useExportContext(
    (c) => c && c.cancelPublishGroupDatabase
  )
  const pagesRes = usePages()
  const publishingStatusRes = usePublishingStatus(group.publishingStatusId!, {
    enabled: group.publishingStatusId !== null,
  })

  // setup publishing log ui
  let _lastPublishedText = 'never'
  if (group.lastPublishedAt) {
    const _date = new Date(group.lastPublishedAt)
    _lastPublishedText = `${_date.toDateString()} ${_date.getHours()}:${_date.getMinutes()}:${_date.getSeconds()}`
  }
  let _publishLog: string[] | null = null
  if (publishingStatusRes.data) {
    _publishLog = publishingStatusRes.data.messageLog
  }

  // setup default page ui
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

  // setup public link
  let _publicUrl: string | null = null
  if (group.lastPublishedAt) {
    _publicUrl = `${process.env.PUBLISHED_URL}/${group._id.substring(2)}`
  }

  const copyLink = () => {
    copyToClipboard(_publicUrl)
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
                showFilter
                ellipsis
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
      <View
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <View flexDirection="row" alignItems="center" pt={pxUnits(1)}>
          <Text variant="uiTextNormal" color="text.2">
            Published:
          </Text>
          <Text variant="uiTextNormal" color="text.3" ml="small">
            {_lastPublishedText}
          </Text>
        </View>
        <View flexDirection="row" alignItems="center">
          {group.isPublishing && <LoadingSvg width={25} height={25} />}
          <Button
            variant="uiLinkPadded"
            onPress={() => {
              if (group.isPublishing) {
                cancelPublishGroupDatabase(group)
              } else {
                setShowPublishLog(true)
                publishGroupDatabase(group)
              }
            }}
          >
            {group.isPublishing ? 'Cancel' : 'Publish now'}
          </Button>
        </View>
      </View>
      {showPublishLog && _publishLog && (
        <View bg="background.1" ml="em" mr="em" p="tiny">
          {_publishLog.map((_msg) => (
            <Text variant="uiTextSmall" color="text.1">
              {_msg}
            </Text>
          ))}
        </View>
      )}
    </>
  )

  const _copyLinkView = group.lastPublishedAt && (
    <>
      <View px="em">
        <Separator spacing="none" color="text.3" />
      </View>
      <View
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <View flexDirection="row" alignItems="center">
          <Text variant="uiTextNormal" color="text.2" pr="small">
            URL:
          </Text>
          <BaseControl href={_publicUrl!} target="_blank">
            <Text
              variant="uiTextNormal"
              color="text.3"
              css={{ textDecoration: 'underline' }}
            >
              {_publicUrl}
            </Text>
          </BaseControl>
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
        {/* <BaseControl
          justifySelf="flex-end"
          onClick={() => {
            copyLink()
            setLinkCopied(true)
          }}
        >
          <Icon color={linkCopied ? 'green.0' : 'text.2'} sizeVariant="small">
            {linkCopied ? <CheckSvg /> : <LinkSvg />}
          </Icon>
        </BaseControl> */}
      </View>
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
          {_publicUrl && _copyLinkView}
        </>
      )}
    </List>
  )
}
