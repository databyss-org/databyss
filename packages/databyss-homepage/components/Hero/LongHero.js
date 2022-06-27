import React, { useState, useEffect, useCallback } from 'react'
import { throttle } from 'lodash'
import { View, Text, Button, Grid } from '@databyss-org/ui/primitives'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import TabletOnly from '@databyss-org/ui/components/Responsive/TabletOnly'
import { pxUnits } from '@databyss-org/ui/theming/views'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import theme, { darkTheme } from '@databyss-org/ui/theming/theme'
import Navbar from '../Navbar'
import { HeroView } from './HeroView'

export const LongHero = ({
  logoSrc,
  title,
  headline,
  ctaButtons,
  navLinks,
  fixedHeader,
  ...others
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const onScroll = useCallback(
    throttle((e) => {
      setScrollTop(e.target.documentElement.scrollTop)
      // console.log(e.target.documentElement.scrollTop)
    }, 100)
  )
  useEffect(() => {
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
  const button = ctaButtons[0]
  const desktopHeaderPosition = fixedHeader ? 'fixed' : 'absolute'
  const tabletLogoSize = scrollTop > 0 ? pxUnits(40) : pxUnits(72)

  return (
    <HeroView fixedHeader={fixedHeader} scrollTop={scrollTop} {...others}>
      <View
        theme={darkTheme}
        position={isMobile ? 'static' : desktopHeaderPosition}
        alignSelf="flex-start"
        left="medium"
        top={scrollTop > 0 ? 'em' : 'medium'}
        zIndex={theme.zIndex.sticky + 1}
        css={{
          transition: 'all linear 100ms',
        }}
      >
        <View flexDirection="row" alignItems="center">
          <img
            src={logoSrc}
            width={isTablet ? tabletLogoSize : pxUnits(64)}
            height="auto"
            alt={title}
            css={{
              transition: 'all linear 100ms',
            }}
          />
          <Text pl="small" variant="uiTextMultiline" color="text.2">
            Databyss
            <br />
            Foundation
          </Text>
        </View>
      </View>
      <TabletOnly>
        <Navbar navLinks={navLinks} fixed={fixedHeader} />
      </TabletOnly>
      <View
        alignItems="center"
        mt={isMobile ? 'large' : 'largest'}
        pt={isMobile ? 'none' : 'large'}
        widthVariant="page"
      >
        <Grid singleRow columnGap={isMobile ? 'tiny' : 'extraLarge'}>
          <View flex="1" minWidth={pxUnits(300)} maxWidth="80%" pb="large">
            <Text variant="uiTextMediumLong" color="text.5">
              <Markdown source={headline} />
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
