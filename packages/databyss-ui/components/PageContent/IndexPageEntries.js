import React from 'react'
import { Text, View, BaseControl, Icon } from '@databyss-org/ui/primitives'

const IndexPageEntries = ({ entries, icon }) =>
  entries.map((entry, index) => {
    if (entry.text) {
      return (
        <View key={index} mb="em" px="medium" widthVariant="content">
          <BaseControl
            py="small"
            hoverColor="background.2"
            activeColor="background.3"
            userSelect="auto"
            childViewProps={{ flexDirection: 'row' }}
          >
            {icon && (
              <Icon sizeVariant="small" color="text.3" mt="tiny" mr="tiny">
                {icon}
              </Icon>
            )}
            <Text
              variant={
                entry.type === 'sources'
                  ? 'bodyNormalUnderline'
                  : 'bodyNormalSemibold'
              }
            >
              {entry.text}
            </Text>
          </BaseControl>
          {entry.citations?.map((citation, i) => (
            <Text key={i} ml="medium" variant="bodySmall" color="text.2">
              {citation}
            </Text>
          ))}
        </View>
      )
    }
    return null
  })

export default IndexPageEntries
