import React from 'react'
import { Text, View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import theme, { pxUnits } from '@databyss-org/ui/theming/theme'
import { renderText, renderTextToComponents } from '../PageContent/FlatPageBody'

export const IndexResultsContainer = ({ children }) => (
  <View mb="medium" widthVariant="content">
    {children}
  </View>
)

export const IndexResultTitle = ({ href, text, icon, dataTestElement }) => (
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
      {text}
    </Text>
  </BaseControl>
)

export const IndexResultDetails = ({
  dataTestElement,
  block,
  icon,
  normalizedStemmedTerms,
  onInlineClick,
  tags,
  ...others
}) => (
  <View position="relative" mb="small">
    <BaseControl
      data-test-element={dataTestElement}
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
        // css={{ pointerEvents: 'all' }}
      >
        {icon}
      </Icon>
    </BaseControl>
    <View
      display="inline-block"
      // pt={pxUnits(10)}
      pt="small"
      pb="tiny"
      zIndex={theme.zIndex.base}
      css={{ lineHeight: pxUnits(24) }}
    >
      {renderTextToComponents({
        key: block._id,
        text: block.text ?? { textValue: '', ranges: [] },
        escapeFn: renderText,
        searchTerms: normalizedStemmedTerms,
        onInlineClick,
      })}
    </View>
    {tags}
  </View>
)
