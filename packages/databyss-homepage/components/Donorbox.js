/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/self-closing-comp */
import React from 'react'
import { Helmet } from 'react-helmet'
import { View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import { Logo } from './Logo'
import foundationContent from '../content/foundationContent.json'

export const EmbedDonorbox = () => {
  const logo = {
    logoSrc: foundationContent.sections[0].logoSrc,
    logoText: (
      <>
        The
        <br />
        Databyss Foundation
      </>
    ),
    imgWidth: pxUnits(40),
    textVariant: 'foundationLogoSmall',
    alt: foundationContent.title,
  }
  return (
    <View theme={darkTheme}>
      <View flexDirection="row" alignItems="center" width="100%">
        <Logo {...logo} p="small" />
        <BaseControl p="small" href="/foundation" flex={1}>
          <Icon sizeVariant="large" color="text.3" alignSelf="flex-end">
            <CloseSvg />
          </Icon>
        </BaseControl>
      </View>
      <Helmet>
        <script src="https://donorbox.org/widget.js"></script>
      </Helmet>
      <iframe
        src="https://donorbox.org/embed/the-databyss-foundation"
        name="donorbox"
        allowpaymentrequest="allowpaymentrequest"
        seamless="seamless"
        frameBorder="0"
        scrolling="no"
        // height="100%"
        // width="100%"
        // style="max-width: 500px; min-width: 250px; max-height:none!important"
      ></iframe>
    </View>
  )
}

export const DonorboxPopup = () => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
  return isMobile ? null : (
    <Helmet>
      <script
        type="text/javascript"
        defer
        src="https://donorbox.org/install-popup-button.js"
      ></script>
    </Helmet>
  )
}

window.DonorBox = { widgetLinkClassName: 'custom-dbox-popup' }
