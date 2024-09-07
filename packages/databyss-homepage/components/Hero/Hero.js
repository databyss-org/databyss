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
        <Text variant="uiTextMedium" mb="small">
          Download Databyss {version}
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
                mb="small"
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
      </View>
    </HeroView>
  )
}
