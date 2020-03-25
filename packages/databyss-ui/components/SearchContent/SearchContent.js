import React, { useState } from 'react'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View, ScrollView } from '@databyss-org/ui/primitives'
import {
  useEntryContext,
  EntrySearchLoader,
} from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

const SearchContent = () => {
  const { getTokensFromPath } = useNavigationContext()

  const { type, id } = getTokensFromPath()

  console.log(id)
  /*
  use same route to update name, just pass it name 
  */

  const ComposeResults = ({ results }) => {
    console.log(results)
    return <div>test</div>
  }

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <EntrySearchLoader query={id}>
        {results => {
          return ComposeResults(results)
        }}
      </EntrySearchLoader>
    </ScrollView>
  )
}

export default SearchContent
