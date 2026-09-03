import React from 'react'
import { RawHtml, Text, View } from '../..'
import defaultContent from './migrate.json'

interface MigrateContent {
  title: string
  body: string
}

export const Migrate = ({
  content = defaultContent,
}: {
  content?: MigrateContent
}) => (
  <View
    widthVariant="form"
    alignItems="left"
    flexGrow={1}
    justifyContent="center"
    mb="extraLarge"
    px="large"
  >
    <Text variant="heading2" color="gray.3" mb="medium">
      {content.title}
    </Text>

    <RawHtml variant="uiTextNormal" html={content.body} />
  </View>
)
