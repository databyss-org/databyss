import React from 'react'
import BaseControl from '@databyss-org/ui/primitives/Control/BaseControl'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
import Grid from '@databyss-org/ui/primitives/Grid/Grid'
import Icon from '@databyss-org/ui/primitives/Icon/Icon'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import LogoSvg from '@databyss-org/ui/assets/logo-thick.svg'
import breakpoints from '@databyss-org/ui/theming/responsive'
import { useMediaQuery } from 'react-responsive'
import { SectionView } from './SectionView'
import footerContent from '../content/footerContent.json'

export const Footer = ({ backgroundImgSrc }) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile })
  return (
    <View
      theme={darkTheme}
      px={isMobile ? 'none' : 'large'}
      backgroundColor="background.1"
      css={{
        background:
          backgroundImgSrc ??
          (footerContent[0].backgroundImgSrc &&
            `url(${footerContent[0].backgroundImgSrc})`),
        backgroundSize: '1800px 485px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom center',
        minHeight: '485px',
      }}
    >
      <SectionView
        mb="extraLarge"
        pt="extraLarge"
        defaultSpacing="medium"
        borderTop="1px solid"
        borderTopColor="text.4"
      >
        <View
          alignSelf="flex-start"
          widthVariant="content"
          mb="extraLarge"
          flexDirection="row"
          alignItems="center"
        >
          <Icon
            sizeVariant="extraLarge"
            alignSelf="flex-start"
            color="text.2"
            pr="small"
          >
            <LogoSvg />
          </Icon>
          <Text variant="uiTextSmall" color="text.1">
            {footerContent[0].content}
          </Text>
        </View>
        <Grid
          columnGap="medium"
          rowGap="large"
          flex="1"
          flexWrap="wrap"
          width="100%"
        >
          {footerContent[0].sections.map((section) => (
            <View
              flex="1"
              key={`footer_section_${section.title}`}
              minWidth="300px"
              pt="small"
              borderTop="1px solid"
              borderTopColor="text.4"
            >
              <Text variant="uiTextHeading" color="text.0" mb="tiny">
                {section.title}
              </Text>
              {section.items.map((item) => (
                <BaseControl
                  key={`footer_item_${section.title}_${item.name}`}
                  href={
                    isMobile && item.mobileRoute ? item.mobileRoute : item.route
                  }
                  mt="small"
                  {...(item.className ? { className: item.className } : {})}
                  {...(item.target ? { target: item.target } : {})}
                >
                  <Text variant="uiTextSmall" color="text.1">
                    {item.name}
                  </Text>
                </BaseControl>
              ))}
            </View>
          ))}
        </Grid>
      </SectionView>
    </View>
  )
}
