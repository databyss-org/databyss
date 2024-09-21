import React from 'react'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
import Button from '@databyss-org/ui/primitives/Button/Button'
import Icon from '@databyss-org/ui/primitives/Icon/Icon'
import { pxUnits } from '@databyss-org/ui/theming/views'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import MobileOnly from '@databyss-org/ui/components/Responsive/MobileOnly'
import TabletOnly from '@databyss-org/ui/components/Responsive/TabletOnly'
import DownloadSvg from '@databyss-org/ui/assets/download.svg'
import { version } from '@databyss-org/services/version'
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
  const isTablet = useMediaQuery({ maxWidth: breakpoints.tablet })

  return (
    <HeroView {...others}>
      <TabletOnly>
        <Navbar navLinks={navLinks} />
      </TabletOnly>
      {isTablet ? (
        <View width="100%" alignItems="center" pt="largest">
          <img src={logoSrc} width={pxUnits(200)} height="auto" alt={title} />
        </View>
      ) : (
        <View
          flexDirection="row"
          alignItems="center"
          position="absolute"
          top="large"
          left="large"
        >
          {logoSrc && (
            <View mr="em">
              <img
                src={logoSrc}
                width={pxUnits(50)}
                height="auto"
                alt={title}
              />
            </View>
          )}
          <Text variant="heading3" color="text.0" textAlign="left">
            Databyss
          </Text>
        </View>
      )}
      <View
        alignItems="left"
        mt={isTablet ? 'largest' : pxUnits(150)}
        px={isTablet ? 'large' : 'none'}
        widthVariant="content"
        pb={pxUnits(20)}
      >
        <View flexDirection="row" alignItems="left" mb="large">
          <Text
            variant={isTablet ? 'heading3' : 'heading2'}
            color="text.0"
            textAlign="left"
          >
            {title}
          </Text>
        </View>
        <Text
          variant="uiTextLarge"
          color="text.0"
          textAlign="left"
          mb={isTablet ? 'none' : pxUnits(48)}
        >
          {headline}
        </Text>
        {isTablet ? (
          <View mt="large" bg="pink" p="small" mr="large">
            <Text variant="uiTextMedium" mb="small">
              Databyss {version} is available for download on MacOS and Windows
              10+.
            </Text>
          </View>
        ) : (
          <>
            <Text variant="uiTextMedium" mb="small">
              Download Databyss {version}
            </Text>
            <View flexDirection="row">
              {ctaButtons.map((button, index) => {
                if (button.mobileOnly && !isTablet) {
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
                    href={button.href?.replace('{version}', version)}
                    childViewProps={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    css={{
                      textDecoration: 'none',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#fff',
                    }}
                    mr="small"
                  >
                    {button.icon && (
                      <Icon sizeVariant="tiny" color="text.0" mr="small">
                        {button.icon === 'download' && <DownloadSvg />}
                      </Icon>
                    )}
                    <Text variant="uiTextNormal" color="text.0">
                      {button.text}
                    </Text>
                  </Button>
                )
              })}
            </View>
            <MobileOnly>
              <Navbar navLinks={navLinks} />
            </MobileOnly>
          </>
        )}
      </View>
    </HeroView>
  )
}
