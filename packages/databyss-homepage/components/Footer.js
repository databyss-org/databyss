import React from 'react'
import {
  BaseControl,
  View,
  Text,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import LogoSvg from '@databyss-org/ui/assets/logo-thick.svg'
import { SectionView } from './SectionView'
import footerContent from '../content/footerContent.json'

export const Footer = () => (
  <View theme={darkTheme} backgroundColor="background.1">
    <SectionView mt="extraLarge" mb="extraLarge" defaultSpacing="medium">
      <View
        alignSelf="flex-start"
        widthVariant="content"
        mb="large"
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
                href={item.route}
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
