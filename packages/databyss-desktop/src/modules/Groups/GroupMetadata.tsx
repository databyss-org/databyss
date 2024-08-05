import React, { ReactNode, useCallback, useState } from 'react'
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
  TextInput,
} from '@databyss-org/ui/primitives'
import { Group } from '@databyss-org/services/interfaces'
import { ValueListItem } from '@databyss-org/ui/components/ValueList/ValueListProvider'

interface GroupMetadataProps {
  value?: boolean
  onChange?: (value: boolean) => void
  readOnly?: boolean
  group: Group
}

export const GroupMetadata = ({
  group,
  readOnly,
  ...others
}: GroupMetadataProps) => {
  return (
    <List
      bg="background.2"
      horizontalItemPadding="em"
      verticalItemPadding="small"
      borderRadius="default"
      {...others}
    >
      <View>
        <Text variant="uiTextNormal" color="text.3">
          Collection subtitle or byline
        </Text>
        <View borderVariant="thinLight">
          <ValueListItem path="subtitle">
            <TextInput
              variant="uiTextNormal"
              placeholder="A collection by [your name here]"
              readonly={readOnly}
            />
          </ValueListItem>
        </View>
      </View>
    </List>
  )
}
