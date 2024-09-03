import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
import Button from '@databyss-org/ui/primitives/Button/Button'
import Grid from '@databyss-org/ui/primitives/Grid/Grid'
import { pxUnits } from '@databyss-org/ui/theming/views'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import MobileOnly from '@databyss-org/ui/components/Responsive/MobileOnly'
import TabletOnly from '@databyss-org/ui/components/Responsive/TabletOnly'
import Navbar from '../Navbar'
import { HeroView } from './HeroView'

export const Hero = ({
  logoSrc,
  title,
  headline,
  ctaButtons,
  navLinks,
  ...others
}) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })

  return (
    <HeroView {...others}>
      <TabletOnly>
        <Navbar navLinks={navLinks} />
      </TabletOnly>
      <View
        alignItems="center"
        mt={isMobile ? 'large' : 'largest'}
        widthVariant="headline"
      >
        <View flexDirection="row" alignItems="center" mb="large">
          {logoSrc && (
            <View mr="em">
              <img
                src={logoSrc}
                width={isTablet ? pxUnits(72) : pxUnits(64)}
                height="auto"
                alt={title}
              />
            </View>
          )}
          <Text
            variant={isTablet ? 'heading1' : 'heading2'}
            color="text.0"
            textAlign="center"
          >
            {title}
          </Text>
        </View>
        <Text
          variant="uiTextMedium"
          color="text.0"
          textAlign="center"
          mb={pxUnits(48)}
        >
          {headline}
        </Text>
        <View>
          {ctaButtons.map((button, index) => {
            if (button.mobileOnly && !isMobile) {
              return null
            }
            if (button.tabletOnly && !isTablet) {
              return null
            }
            return (
              <Button
                minWidth={60}
                key={index}
                variant="pinkHighlighted"
                href={button.href}
                childViewProps={{ flexDirection: 'row' }}
                css={{
                  textDecoration: 'none',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#fff',
                }}
                mb="small"
              >
                <Text variant="uiTextNormalSemibold" color="text.0">
                  {button.text}
                </Text>
              </Button>
            )
          })}
        </View>
        <MobileOnly>
          <Navbar navLinks={navLinks} />
        </MobileOnly>
      </View>
    </HeroView>
  )
}
