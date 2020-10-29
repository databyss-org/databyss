import React from 'react'

import { pruneCitation } from '@databyss-org/services/citations/lib'

import { RawHtml, View } from '../../primitives'

const Citation = props => {
  const { citation, formatOptions, childViewProps } = props

  const render = () => (
    <View {...childViewProps}>
      <RawHtml html={pruneCitation(citation, formatOptions.styleId)} />
    </View>
  )

  return render()
}

export default Citation
