import React, { useState, useEffect } from 'react'
import { View, TextInput, Grid, Button } from '@databyss-org/ui/primitives'
import { SidebarList, useNavigationContext } from '@databyss-org/ui/components'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import { sidebarMenuItems } from './fixtures'

const href = (location: Location) =>
  (
    location.pathname + (location.search?.length ? `?${location.search}` : '')
  ).replace('/false/', '/ACCOUNT_ID/')

export const LocationToolbar = () => {
  const { location, navigate } = useNavigationContext()
  const [locationValue, setLocationValue] = useState({
    textValue: href(location),
  })
  useEffect(() => {
    setLocationValue({ textValue: href(location) })
  }, [location])
  return (
    <Grid singleRow my="small" columnGap="tiny">
      <View borderVariant="thinLight" paddingVariant="tiny" flexGrow={1}>
        <TextInput value={locationValue} onChange={setLocationValue} />
      </View>
      <View>
        <Button onPress={() => navigate(locationValue.textValue)}>Go</Button>
      </View>
    </Grid>
  )
}

export const NavigationSidebar = () => (
  <View>
    <LocationToolbar />
    <View
      height={500}
      width={250}
      flexGrow={0}
      theme={darkTheme}
      bg="background.1"
    >
      <SidebarList menuItems={sidebarMenuItems} />
    </View>
  </View>
)
