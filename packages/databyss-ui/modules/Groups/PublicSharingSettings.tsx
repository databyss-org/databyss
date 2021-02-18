import React, { ReactNode } from 'react'
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

interface IconControlProps extends BaseControlProps {
  icon: ReactNode
  label: string
  color: string
}

export const IconControl = ({
  icon,
  label,
  color,
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
    <Icon sizeVariant="small" mr="small" color={color}>
      {icon}
    </Icon>
  </BaseControl>
)

interface PublicSharingSettingsProps {
  value?: boolean
  onChange?: (value: boolean) => void
}

export const PublicSharingSettings = ({
  value,
  onChange,
  ...others
}: PublicSharingSettingsProps) => (
  <List
    bg="background.2"
    horizontalItemPadding="em"
    verticalItemPadding="small"
    borderRadius="default"
    {...others}
  >
    <SwitchControl
      label="Public collection"
      alignLabel="left"
      textVariant="uiTextNormal"
      labelTextProps={{
        color: 'text.2',
      }}
      value={value}
      onChange={onChange}
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
      <IconControl icon={<LinkSvg />} label="Copy link" color="text.2" />
    )}
  </List>
)
