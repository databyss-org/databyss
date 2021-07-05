import React from 'react'
import { pruneCitation } from '@databyss-org/services/citations/lib'
import { CitationFormatOptions } from '@databyss-org/services/interfaces'
import {
  RawHtml,
  TextProps,
  View,
  ViewProps,
} from '@databyss-org/ui/primitives'

export interface CitationViewProps extends ViewProps {
  citation: string
  formatOptions: CitationFormatOptions
  textProps?: TextProps
}

export const CitationView = ({
  citation,
  formatOptions,
  textProps = {
    color: 'gray.4',
    style: {
      lineHeight: 1.5,
    },
  },
  ...others
}) => (
  <View py="small" {...others}>
    <RawHtml
      html={pruneCitation(citation, formatOptions.styleId)}
      {...textProps}
    />
  </View>
)
