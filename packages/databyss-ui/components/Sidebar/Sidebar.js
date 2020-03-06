import React, { useState } from 'react'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import ArrowLeft from '@databyss-org/ui/assets/arrowLeft.svg'
import ArrowRight from '@databyss-org/ui/assets/arrowRight.svg'

import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
  TextControl,
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
  const [value1, setValue1] = useState({ textValue: 'value', ranges: [] })

  const menuItems = [
    {
      svg: menuOpen ? <ArrowLeft /> : <Databyss />,
      text: 'Databyss',
      action: () => setMenuOpen(!menuOpen),
    },
    {
      svg: <PageSvg />,
      text: 'Pages',
      action: () => console.log('PAGES'),
      list: [
        { id: 'someId', title: 'Page Title 1' },
        { id: 'someId', title: 'Page Title 2' },
      ],
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

  return (
    <View alignItems="stretch" flexGrow={1} width="100%">
      <Grid>
        <View
          {...defaultProps}
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          <View
            widthVariant="content"
            theme={darkTheme}
            bg="background.0"
            width={300}
            pt={'medium'}
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
                  <BaseControl
                    key={index}
                    width="100%"
                    onClick={item.action}
                    alignItems={!menuOpen && 'flex-end'}
                  >
                    {menuOpen ? (
                      <View>
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
                          {index ? (
                            <View position="absolute" right="small">
                              <Icon sizeVariant="small" color="text.3">
                                <ArrowRight />
                              </Icon>
                            </View>
                          ) : null}
                        </Grid>
                      </View>
                    ) : (
                      <Grid
                        singleRow
                        id="here"
                        alignItems="flex-end"
                        columnGap="small"
                      >
                        <Icon
                          sizeVariant={!index || !menuOpen ? 'medium' : 'tiny'}
                          color="text.3"
                        >
                          {item.svg}
                        </Icon>
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
            transform: menuOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          <TextControl
            variant="uiTextNormal"
            value={value1}
            onChange={setValue1}
            rich
          />
          {children}
        </View>
      </Grid>
    </View>
  )
}

export default Sidebar
