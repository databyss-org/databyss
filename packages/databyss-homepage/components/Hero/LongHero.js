import React from 'react'
// import { throttle } from 'lodash'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
// import Grid from '@databyss-org/ui/primitives/Grid/Grid'
// import Button from '@databyss-org/ui/primitives/Button/Button'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
// import TabletOnly from '@databyss-org/ui/components/Responsive/TabletOnly'
import { pxUnits } from '@databyss-org/ui/theming/views'
import Markdown from '@databyss-org/ui/components/Util/Markdown'
import theme, { darkTheme } from '@databyss-org/ui/theming/theme'
// import Navbar from '../Navbar'
import { HeroView } from './HeroView'
import { Logo } from '../Logo'

export const LongHero = ({
  logoSrc,
  title,
  headline,
  ctaButtons,
  navLinks,
  fixedHeader,
  ...others
}) => {
  const scrollTop = 0
  // const [scrollTop, setScrollTop] = useState(0)
  // const onScroll = useCallback(
  //   throttle(() => {
  //     setScrollTop(window.scrollY)
  //     // console.log(e.target.documentElement.scrollTop)
  //   }, 100)
  // )
  // useEffect(() => {
  //   window.addEventListener('scroll', onScroll)
  //   onScroll()
  //   return () => window.removeEventListener('scroll', onScroll)
  // }, [])

  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
  const button = ctaButtons?.[0]
  const desktopHeaderPosition = fixedHeader ? 'fixed' : 'absolute'
  const tabletLogoSize = scrollTop > 25 ? pxUnits(40) : pxUnits(72)
  const tabletLogoVariant =
    scrollTop > 25 ? 'foundationLogoSmall' : 'foundationLogoNormal'
  const logo = {
    logoSrc,
    logoText: isTablet ? (
      <>
        The
        <br />
        Databyss Foundation
      </>
    ) : null,
    imgWidth: isTablet ? tabletLogoSize : pxUnits(64),
    textVariant: isTablet ? tabletLogoVariant : 'foundationLogoNormal',
    alt: title,
  }

  return (
    <HeroView
      fixedHeader={isTablet && fixedHeader}
      scrollTop={scrollTop}
      pb={isMobile ? 'large' : 'largest'}
      pl={isMobile ? 'medium' : 'extraLarge'}
      pr={isMobile ? 'large' : 'none'}
      alignItems="left"
      {...others}
    >
      <View
        mt={isMobile ? 'extraLarge' : 'none'}
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
        <Logo {...logo} />
      </View>
      {/* <TabletOnly>
        <Navbar navLinks={navLinks} fixed={fixedHeader} top="em" />
      </TabletOnly> */}
      <View
        alignItems="left"
        mt={isMobile ? 'extraLarge' : 'largest'}
        pt={isMobile ? 'none' : 'extraLarge'}
        mr="largest"
        widthVariant="wideContent"
      >
        <View flex="1" minWidth={pxUnits(300)} pb="large">
          <Text variant="uiTextMediumLong" color="text.1">
            <Markdown source={headline} />
          </Text>
        </View>
      </View>
    </HeroView>
  )
}
