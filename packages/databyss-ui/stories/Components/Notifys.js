import React, { useState } from 'react'
import { Button } from '@databyss-org/ui/primitives'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import Section from '../Section'

export const NotifyMessage = () => {
  const { notify } = useNotifyContext()
  return (
    <Section title="Notify">
      <Button onPress={() => notify('This is a notification message.')}>
        Notify Message
      </Button>
    </Section>
  )
}

export const NotifyError = () => {
  const { notifyError } = useNotifyContext()
  return (
    <Section title="Notify Error">
      <Button onPress={() => notifyError('⚠️This is an error message.')}>
        Notify Error
      </Button>
    </Section>
  )
}

const ErrorThrowingComponent = ({ throws }) => {
  if (throws) {
    throw new Error('☠️Error was thrown in component render')
  }
  return null
}

export const TriggerError = () => {
  const [throws, setThrows] = useState(false)
  return (
    <Section title="Trigger Errors">
      <Button
        onPress={() => {
          setThrows(true)
        }}
      >
        Throw Error in Component Render
      </Button>
      <ErrorThrowingComponent throws={throws} />
      <Button
        onPress={() => {
          throw new Error('☠️Error was thrown in event handler')
        }}
      >
        Throw Error in Event Handler
      </Button>
    </Section>
  )
}
