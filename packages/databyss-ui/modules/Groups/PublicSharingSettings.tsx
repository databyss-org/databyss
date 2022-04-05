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
} from '@databyss-org/ui/primitives'
import LinkSvg from '@databyss-org/ui/assets/link.svg'
import CheckSvg from '@databyss-org/ui/assets/check.svg'

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
      <Text variant="uiTextSmall" color={color}>
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
}

export const PublicSharingSettings = ({
  value,
  onClick,
  onChange,
  readOnly,
  ...others
}: PublicSharingSettingsProps) => {
  const [linkCopied, setLinkCopied] = useState(false)
  return (
    <List
      bg="background.2"
      horizontalItemPadding="em"
      verticalItemPadding="small"
      borderRadius="default"
      {...others}
    >
      <SwitchControl
        label="Public collection"
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
      <View px="em">
        <Separator spacing="none" color="text.3" />
      </View>
      {!value ? (
        <View pr="large" pb="em">
          <Text variant="uiTextSmall" color="text.2">
            Anyone with the link can view a public collection.
          </Text>
        </View>
      ) : (
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
      )}
    </List>
  )
}
