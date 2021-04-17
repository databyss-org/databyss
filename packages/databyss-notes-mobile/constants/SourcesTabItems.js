import { uid } from '@databyss-org/data/lib/uid'
import React from 'react'

import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'

const SourcesTabItems = [
  {
    _id: uid(),
    label: 'All sources',
    icon: <SourcesSvg />,
    url: '/sources',
  },
  {
    _id: uid(),
    label: 'All authors',
    icon: <AuthorsSvg />,
    url: '/sources/authors',
  },
]

export default SourcesTabItems
