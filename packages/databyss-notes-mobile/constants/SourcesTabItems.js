import ObjectId from 'bson-objectid'
import React from 'react'

import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'

const SourcesTabItems = [
  {
    _id: new ObjectId().toHexString(),
    label: 'All sources',
    icon: <SourcesSvg />,
    url: '/sources',
  },
  {
    _id: new ObjectId().toHexString(),
    label: 'All authors',
    icon: <AuthorsSvg />,
    url: '/sources/authors',
  },
]

export default SourcesTabItems
