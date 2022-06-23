import React from 'react'
import { View, Text, Button, Grid } from '@databyss-org/ui/primitives'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import MobileOnly from '@databyss-org/ui/components/Responsive/MobileOnly'
import TabletOnly from '@databyss-org/ui/components/Responsive/TabletOnly'
import { pxUnits } from '@databyss-org/ui/theming/views'
import Navbar from '../Navbar'
import { HeroView } from './HeroView'

export const LongHero = ({
  logoSrc,
  title,
  headline,
  ctaButtons,
  navLinks,
  ...others
}) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
  const button = ctaButtons[0]

  return (
    <HeroView {...others}>
      <View
        position={isMobile ? 'static' : 'absolute'}
        alignSelf="flex-start"
        left="medium"
        top="medium"
      >
        <img
          src={logoSrc}
          width={isTablet ? pxUnits(72) : pxUnits(64)}
          height="auto"
          alt={title}
        />
      </View>
      <TabletOnly>
        <Navbar navLinks={navLinks} />
      </TabletOnly>
      <View
        alignItems="center"
        mt={isMobile ? 'large' : 'largest'}
        widthVariant="page"
      >
        <Grid singleRow columnGap={isMobile ? 'tiny' : 'extraLarge'}>
          <View flex="1" minWidth={pxUnits(300)} maxWidth="80%" pb="large">
            <Text variant="uiTextMediumLong" color="text.5">
              {headline}
            </Text>
          </View>
          <View>
            <Button
              minWidth={60}
              variant="pinkHighlighted"
              href={button.href}
              {...(button.className ? { className: button.className } : {})}
              childViewProps={{ flexDirection: 'row' }}
              css={{
                textDecoration: 'none',
              }}
            >
              <Text variant="uiTextNormalSemibold" color="text.5">
                {button.text}
              </Text>
            </Button>
          </View>
        </Grid>
      </View>
    </HeroView>
  )
}
