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
import { Group } from '@databyss-org/services/interfaces'
import { useDatabaseContext } from '@databyss-org/services/lib/DatabaseProvider'

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
  onClick: () => void
  onChange?: (value: boolean) => void
  readOnly?: boolean
  group: Group
}

export const PublicSharingSettings = ({
  value,
  onClick,
  onChange,
  readOnly,
  group,
  ...others
}: PublicSharingSettingsProps) => {
  const [linkCopied, setLinkCopied] = useState(false)
  const publishGroupDatabase = useDatabaseContext(
    (c) => c && c.publishGroupDatabase
  )

  // console.log('[PublicSharingSettings]', group.lastPublishedAt)

  let _lastPublishedText = 'never'
  if (group.isPublishing) {
    _lastPublishedText = 'publishing'
  } else if (group.lastPublishedAt) {
    const _date = new Date(group.lastPublishedAt)
    _lastPublishedText = `${_date.toDateString()} ${_date.getHours()}:${_date.getMinutes()}:${_date.getSeconds()}`
  }
  return (
    <List
      bg="background.2"
      horizontalItemPadding="em"
      verticalItemPadding="small"
      borderRadius="default"
      {...others}
    >
      <SwitchControl
        label="Publish collection as website"
        data-test-element="group-public"
        alignLabel="left"
        textVariant="uiTextNormal"
        labelTextProps={{
          color: 'text.2',
        }}
        value={value}
        onChange={onChange}
        disabled={readOnly}
      />
      {value && (
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
                variant="uiLink"
                alignSelf="flex-end"
                onPress={() => {
                  publishGroupDatabase(group)
                }}
              >
                {group.isPublishing ? 'Cancel' : 'Publish now'}
              </Button>
            </View>
          </Grid>
          {group.lastPublishedAt && (
            <>
              <View px="em">
                <Separator spacing="none" color="text.3" />
              </View>
              <IconControl
                data-test-element="copy-link"
                onClick={() => {
                  setLinkCopied(true)
                  if (onClick) {
                    onClick()
                  }
                }}
                icon={linkCopied ? <CheckSvg /> : <LinkSvg />}
                iconColor={linkCopied ? 'green.0' : 'text.2'}
                color="text.2"
                label={linkCopied ? 'Link copied' : 'Copy link'}
              />
            </>
          )}
        </>
      )}
    </List>
  )
}
