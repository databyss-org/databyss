import React from 'react'
import { View, Text, TextInput, Button } from '@databyss-org/ui/primitives'
import Login from '@databyss-org/ui/modules/Login/Login'
import Navbar from '@databyss-org/ui/modules/Homepage/Navbar'
import SignUpForm from '@databyss-org/ui/modules/Homepage/SignUpForm'
import LogoSvg from '@databyss-org/ui/assets/databyss.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useMediaQuery } from 'react-responsive'

const Public = () => (
  <>
    <View p="large" pb="extraLarge" width="100%" backgroundColor="background.6">
      <Navbar />
      <View alignItems="center" mt="large">
        <Text variant="heading1" color="text.6" textAlign="center" mb="large">
          Databyss
        </Text>
        <Text
          variant="uiTextNormal"
          color="text.5"
          textAlign="center"
          maxWidth={pxUnits(560)}
          mb={pxUnits(48)}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
          euismod quam. Curabitur at euismod tortor. Mauris vitae sem augue. Sed
          interdum augue ac ex lobortis gravida.
        </Text>
      </View>
      <SignUpForm />

      {/* <Login {...props} /> */}
    </View>
    <View backgroundColor="background.1" flexGrow="1" p="large">
      <View>
        <Text variant="heading3" color="text.1" mb="medium">
          Search
        </Text>
        <Text variant="uiTextLarge" color="text.3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
          euismod quam. Curabitur at euismod tortor. Mauris vitae sem augue. Sed
          interdum augue ac ex lobortis gravida.
        </Text>
      </View>
    </View>
  </>
)

export default Public
