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
    throttle(() => {
      setScrollTop(window.scrollY)
      // console.log(e.target.documentElement.scrollTop)
    }, 100)
  )
  useEffect(() => {
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
  const button = ctaButtons[0]
  const desktopHeaderPosition = fixedHeader ? 'fixed' : 'absolute'
  const tabletLogoSize = scrollTop > 25 ? pxUnits(40) : pxUnits(72)
  const tabletLogoVariant =
    scrollTop > 25 ? 'foundationLogoSmall' : 'foundationLogoNormal'

  return (
    <HeroView
      fixedHeader={isTablet && fixedHeader}
      scrollTop={scrollTop}
      {...others}
    >
      <View
        theme={darkTheme}
        alignSelf="flex-start"
        left="em"
        top={scrollTop > 25 ? 'em' : 'medium'}
        zIndex={theme.zIndex.sticky + 1}
        onClick={() => {
          window.scrollTo(0, 0)
        }}
        css={{
          transition: 'all linear 50ms',
          position: isMobile ? 'static' : desktopHeaderPosition,
          cursor: 'pointer',
        }}
      >
        <View flexDirection="row" alignItems="center">
          <img
            src={logoSrc}
            width={isTablet ? tabletLogoSize : pxUnits(64)}
            height="auto"
            alt={title}
            css={{
              transition: 'all linear 50ms',
            }}
          />
          {isTablet && (
            <Text
              pl="small"
              variant={isTablet ? tabletLogoVariant : 'foundationLogoNormal'}
              color="text.2"
            >
              The <br />
              Databyss Foundation
            </Text>
          )}
        </View>
      </View>
      <TabletOnly>
        <Navbar navLinks={navLinks} fixed={fixedHeader} />
      </TabletOnly>
      <View
        alignItems="center"
        mt={isMobile ? 'large' : 'largest'}
        pt={isMobile ? 'none' : 'extraLarge'}
        widthVariant="page"
      >
        <Grid singleRow columnGap={isMobile ? 'tiny' : 'extraLarge'}>
          <View flex="1" minWidth={pxUnits(300)} maxWidth="80%" pb="large">
            <Text variant="uiTextMediumLong" color="text.1">
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
              <Text variant="uiTextNormalSemibold" color="text.1">
                {button.text}
              </Text>
            </Button>
          </View>
        </Grid>
      </View>
    </HeroView>
  )
}
