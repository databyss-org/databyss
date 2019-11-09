import React from 'react'
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
