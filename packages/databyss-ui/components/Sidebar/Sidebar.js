import React, { useState } from 'react'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import Arrow from '@databyss-org/ui/assets/arrowLeft.svg'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
  Button,
} from '@databyss-org/ui/primitives'
import { Viewport } from '@databyss-org/ui'
import { darkTheme } from '../../theming/theme'
import {
  space,
  layout,
  flexbox,
  border,
  position,
  compose,
  variant,
  color,
} from 'styled-system'
import styled from '../../primitives/styled'
import css from '@styled-system/css'

export const defaultProps = {
  height: '100vh',
  flexDirection: 'column',
}

const Section = ({ children, title, variant, ...others }) => (
  <View mb="medium" {...others}>
    <View mb="small">
      <Text variant={variant} color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </View>
)

Section.defaultProps = {
  variant: 'heading3',
}

const Sidebar = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(true)

  const menuItems = [
    {
      svg: <Arrow />,
      text: 'Databyss',
      action: () => setMenuOpen(!menuOpen),
    },
    {
      svg: <PageSvg />,
      text: 'Pages',
      action: () => console.log('PAGES'),
    },
    {
      svg: <SourceSvg />,
      text: 'Sources',
      action: () => console.log('SOURCES'),
    },
    {
      svg: <AuthorSvg />,
      text: 'Authors',
      action: () => console.log('AUTHORS'),
    },
    {
      svg: <TopicSvg />,
      text: 'Topics',
      action: () => console.log('TOPICS'),
    },
  ]

  console.log(menuOpen)

  return (
    <View alignItems="stretch" flexGrow={1} width="100%">
      <Grid>
        <View
          {...defaultProps}
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-250px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          <View
            widthVariant="content"
            theme={darkTheme}
            bg="background.0"
            width={300}
          >
            <List
              verticalItemPadding={2}
              horizontalItemPadding={2}
              height="100vh"
              mt="none"
              mb="none"
              alignItems={menuOpen ? 'center' : 'flex-end'}
            >
              {menuItems.reduce((acc, item, index) => {
                if (index > 0) {
                  acc.push(
                    <Separator color="border.1" key={`separator${index}`} />
                  )
                }
                acc.push(
                  <BaseControl key={index} width="100%" onClick={item.action}>
                    {menuOpen ? (
                      <Grid singleRow alignItems="center" columnGap="small">
                        <Icon
                          sizeVariant={index ? 'tiny' : 'medium'}
                          color="text.3"
                        >
                          {item.svg}
                        </Icon>
                        <Text
                          variant={index ? 'uiTextSmall' : 'uiTextLarge'}
                          color="text.2"
                        >
                          {item.text}
                        </Text>
                      </Grid>
                    ) : (
                      <Grid
                        singleRow
                        id="here"
                        alignItems="flex-end"
                        columnGap="small"
                      >
                        <Icon
                          sizeVariant={index ? 'tiny' : 'medium'}
                          color="text.3"
                        >
                          {item.svg}
                        </Icon>
                        <Text
                          variant={index ? 'uiTextSmall' : 'uiTextLarge'}
                          color="text.2"
                        >
                          {item.text}
                        </Text>
                      </Grid>
                    )}
                  </BaseControl>
                )
                return acc
              }, [])}
            </List>
          </View>
        </View>

        <View
          width={500}
          display="flex"
          // TODO: REMOVE THIS PART
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-300px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          {children}
        </View>
      </Grid>
    </View>
  )
}

export default Sidebar
