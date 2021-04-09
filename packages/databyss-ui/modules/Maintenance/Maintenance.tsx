import React from 'react'
import { RawHtml, Text, View } from '../..'
import defaultContent from './maintenance.json'

interface MaintenanceContent {
  title: string
  body: string
}

export const Maintenance = ({
  content = defaultContent,
}: {
  content: MaintenanceContent
}) => (
  <View
    widthVariant="form"
    alignItems="left"
    flexGrow={1}
    justifyContent="center"
    mb="extraLarge"
  >
    <Text variant="heading2" color="gray.3" mb="medium">
      {content.title}
    </Text>

    <RawHtml variant="uiTextNormal" html={content.body} />
  </View>
)
