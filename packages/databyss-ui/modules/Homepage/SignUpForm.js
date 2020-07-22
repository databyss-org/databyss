import React from 'react'
import { View, TextInput, Button } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useMediaQuery } from 'react-responsive'

const SignUpForm = () => (
  // const isMobile = useMediaQuery({ maxWidth: 600 })

  <View flexDirection="row" justifyContent="center" mb={pxUnits(48)}>
    <View
      backgroundColor="background.2"
      justifyContent="center"
      py="small"
      px="em"
      borderRadius="default"
      mr="em"
      width="100%"
      maxWidth={pxUnits(240)}
    >
      <TextInput
        placeholder="Enter your email..."
        value="email"
        variant="uiTextNormal"
      />
    </View>
    <Button variant="pinkHighlighted">Sign up</Button>
  </View>
)

export default SignUpForm
