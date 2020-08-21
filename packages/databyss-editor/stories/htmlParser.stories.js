import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text, RawHtml } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import SingleLine from '../components/SingleLine'
import { stateBlocktoHtmlResults } from '../lib/slateUtils'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

storiesOf('Selenium//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('html parser', () => {
    const searchTerm = 'this has'

    const _text = {
      textValue: 'test this fragment has this',
      ranges: [{ length: 2, marks: ['bold'], offset: 2 }],
    }

    const _block = { text: _text, id: '', type: 'ENTRY' }

    const _searchTerm = searchTerm.split(' ')
    const ranges = []

    // add search ranges to block
    _searchTerm.forEach(word => {
      // normalize diactritics
      const parts = _block.text.textValue
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(
          new RegExp(
            `\\b${word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}\\b`,
            'i'
          )
        )

      console.log(parts)

      let offset = 0

      parts.forEach((part, i) => {
        console.log('part', part)
        //  const offset = part.length
        const length = word.length

        if (i !== 0) {
          ranges.push({
            offset: offset - word.length,
            length,
            marks: ['highlight'],
          })
        }

        offset = offset + part.length + word.length
      })
    })

    _block.text.ranges = [..._block.text.ranges, ...ranges]

    console.log(_block)

    // stateBlockToSlateBlock
    const _frag = stateBlocktoHtmlResults(_block)

    console.log(_frag)

    console.log(ranges)

    return (
      <View>
        <RawHtml html={_frag} />
      </View>
    )
  })
