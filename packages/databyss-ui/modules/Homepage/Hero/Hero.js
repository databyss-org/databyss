import React from 'react'
import { View, Text, Button, Grid } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import Navbar from '@databyss-org/ui/modules/Homepage/Hero/Navbar'
import MobileOnly from '../../../components/Responsive/MobileOnly'
import TabletOnly from '../../../components/Responsive/TabletOnly'

const Hero = ({
  logoSrc,
  title,
  headline,
  buttonText,
  buttonHref,
  backgroundImgSrc,
  backgroundColor,
  navLinks,
}) => {
  const isTablet = useMediaQuery({ minWidth: breakpoints.tablet })
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })

  return (
    <View
      p="large"
      pb={isMobile ? 'extraLarge' : 'largest'}
      width="100%"
      alignItems="center"
      css={{
        backgroundColor,
        background: backgroundImgSrc && `url(${backgroundImgSrc})`,
      }}
    >
      <TabletOnly>
        <Navbar navLinks={navLinks} />
      </TabletOnly>
      <View
        alignItems="center"
        mt={isMobile ? 'large' : 'largest'}
        widthVariant="headline"
      >
        <View flexDirection="row" alignItems="center" mb="large">
          <View mr="em">
            <img
              src={logoSrc}
              width={isTablet ? pxUnits(72) : pxUnits(64)}
              height="auto"
              alt="Logo"
            />
          </View>
          <Text
            variant={isTablet ? 'heading1' : 'heading2'}
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
        <Grid singleRow>
          <Button
            variant="pinkHighlighted"
            href={buttonHref}
            childViewProps={{ flexDirection: 'row' }}
            css={{
              textDecoration: 'none',
            }}
          >
            <Text variant="uiTextNormalSemibold" color="text.5">
              Sign Up
            </Text>
            {buttonText.normal && (
              <Text variant="uiTextNormal" color="text.5">
                &nbsp;{buttonText.normal}
              </Text>
            )}
          </Button>
          <Button
            variant="pinkHighlighted"
            href={buttonHref}
            childViewProps={{ flexDirection: 'row' }}
            css={{
              textDecoration: 'none',
            }}
          >
            <Text variant="uiTextNormalSemibold" color="text.5">
              Login
            </Text>
            {buttonText.normal && (
              <Text variant="uiTextNormal" color="text.5">
                &nbsp;{buttonText.normal}
              </Text>
            )}
          </Button>
        </Grid>
        <MobileOnly>
          <Navbar navLinks={navLinks} />
        </MobileOnly>
      </View>
    </View>
  )
}

export default Hero
