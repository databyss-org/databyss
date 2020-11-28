import React from 'react'

import { pruneCitation } from '@databyss-org/services/citations/lib'

import { RawHtml, View } from '../../primitives'

const Citation = (props) => {
  const { citation, formatOptions, childViewProps, citationTextProps } = props

  const render = () => (
    <View {...childViewProps}>
      <RawHtml
        html={pruneCitation(citation, formatOptions.styleId)}
        {...citationTextProps}
      />
    </View>
  )

  return render()
}

export default Citation
