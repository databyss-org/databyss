import React, { useState } from 'react'
import { Modal, Button, Text } from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section } from './'

const alea = new Alea('modals')
const ipsum = loremIpsum({ units: 'sentences', count: 4, random: alea })

export default () => {
  const [visible, setVisible] = useState(false)

  return (
    <Section title="Default modal">
      <Button onPress={() => setVisible(true)}>Show Modal</Button>
      <Modal visible={visible} title="Hello modal!">
        <Text>{ipsum}</Text>
      </Modal>
    </Section>
  )
}
