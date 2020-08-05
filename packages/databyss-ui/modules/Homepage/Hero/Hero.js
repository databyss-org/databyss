import React from 'react'
import { View, Text, Icon, Button } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { mobileBreakpoint } from '@databyss-org/ui/theming/mediaBreakpoints'
import { useMediaQuery } from 'react-responsive'

const Hero = ({ logoSrc, title, headline, buttonText, buttonHref }) => {
  const isMobile = useMediaQuery(mobileBreakpoint)

  return (
    <View alignItems="center" mt="extraLarge" widthVariant="content">
      <View flexDirection="row" alignItems="center" mb="large">
        <Icon
          color="text.6"
          sizeVariant={isMobile ? 'logoSmall' : 'logoLarge'}
          mr="small"
        >
          {logoSrc}
        </Icon>
        <Text
          variant={isMobile ? 'heading2' : 'heading1'}
          color="text.6"
          textAlign="center"
        >
          {title}
        </Text>
      </View>
      <Text
        variant="uiTextMedium"
        color="text.5"
        textAlign="center"
        mb={pxUnits(48)}
      >
        {headline}
      </Text>
      <Button
        variant="pinkHighlighted"
        href={buttonHref}
        childViewProps={{ flexDirection: 'row' }}
        css={{
          textDecoration: 'none',
        }}
      >
        {buttonText}
      </Button>
    </View>
  )
}

export default Hero
