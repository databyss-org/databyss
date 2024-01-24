import React, { ReactNode } from 'react'
import {
  Text,
  View,
  BaseControl,
  Icon,
  BaseControlProps,
  RawHtml,
} from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { Block } from '@databyss-org/services/interfaces'
import { renderText, renderTextToComponents } from '../PageContent/FlatPageBody'
import { SearchTerm } from '@databyss-org/data/couchdb/couchdb'
import {
  createHighlightRanges,
  InlineAtomicDef,
} from '@databyss-org/editor/lib/util'
import { useSearchContext } from '../../hooks'
import { textToHtml } from '@databyss-org/services/blocks'

export const IndexResultsContainer = ({ children }) => (
  <View mb="medium" widthVariant="content">
    {children}
  </View>
)

export const IndexResultTitle = ({ href, text, icon, dataTestElement }) => {
  const searchTerms = useSearchContext((c) => c && c.normalizedStemmedTerms)
  const _highlightRanges = createHighlightRanges(text, searchTerms)
  return (
    <BaseControl
      data-test-element={dataTestElement}
      href={href}
      py="tiny"
      mb="tiny"
      childViewProps={{ justifyContent: 'center' }}
    >
      <Icon
        sizeVariant="tiny"
        color="gray.4"
        position="absolute"
        left="mediumNegative"
      >
        {icon}
      </Icon>
      <Text color="text.2" variant="uiTextNormalSemibold">
        <RawHtml
          html={textToHtml({
            textValue: text,
            ranges: _highlightRanges,
          })}
        />
      </Text>
    </BaseControl>
  )
}

export interface IndexResultDetailsProps extends BaseControlProps {
  dataTestElement: string
  block: Block
  icon: ReactNode
  normalizedStemmedTerms: SearchTerm[]
  onInlineClick: (d: InlineAtomicDef) => null
  tags: ReactNode
  textVariant: string
  textOnly: boolean
  bindAtomicId?: string
  theme: any
}

export const IndexResultDetails = ({
  dataTestElement,
  block,
  icon,
  normalizedStemmedTerms,
  onInlineClick,
  tags,
  textVariant,
  textOnly = false,
  bindAtomicId,
  theme,
  ...others
}: IndexResultDetailsProps) => {
  const res = useDocument<Block>(block._id)
  if (!res.isSuccess) {
    return null
  }
  // console.log(
  //   '[IndexResultDetails] render',
  //   block._id,
  //   res.data?.text?.textValue
  // )
  return (
    <View position="relative" mb="small" data-test-element={dataTestElement}>
      <BaseControl
        data-test-element="index-result-links"
        hoverColor="background.2"
        activeColor="background.3"
        mt="tiny"
        left="mediumNegative"
        position="absolute"
        // width="100%"
        height="100%"
        // css={{ pointerEvents: 'none' }}
        {...others}
      >
        <Icon
          sizeVariant="tiny"
          color="gray.5"
          my="small"
          pt={pxUnits(1)}
          // css={{ pointerEvents: 'all' }}
        >
          {icon}
        </Icon>
      </BaseControl>
      <Text
        variant={textVariant}
        display="inline-block"
        // pt={pxUnits(10)}
        pt="small"
        pb="tiny"
        css={{ lineHeight: pxUnits(22), zIndex: theme.zIndex.base }}
      >
        {renderTextToComponents({
          key: block._id,
          text: res.data.text ?? { textValue: '', ranges: [] },
          escapeFn: renderText,
          searchTerms: normalizedStemmedTerms,
          onInlineClick,
          textOnly,
          bindAtomicId,
          theme,
        })}
      </Text>
      {tags}
    </View>
  )
}
