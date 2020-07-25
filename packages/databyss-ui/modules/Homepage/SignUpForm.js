import React from 'react'
import { View, TextInput, Button } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { useMediaQuery } from 'react-responsive'

const SignUpForm = () => {
  const isMobile = useMediaQuery({ maxWidth: 425 })

  return (
    <View
      flexDirection={isMobile ? 'column' : 'row'}
      justifyContent="center"
      alignItems="center"
      mb={pxUnits(48)}
    >
      <View
        backgroundColor="background.2"
        justifyContent="center"
        py="small"
        px="em"
        borderRadius="default"
        mr={isMobile ? 'none' : 'em'}
        mb={isMobile ? 'em' : 'none'}
        width="100%"
        maxWidth={isMobile ? 'none' : pxUnits(240)}
      >
        <TextInput
          placeholder="Enter your email..."
          value="email"
          variant="uiTextNormal"
        />
      </View>
      <Button variant="pinkHighlighted" width={isMobile ? '100%' : 'auto'}>
        Sign up
      </Button>
    </View>
  )
}

export default SignUpForm
