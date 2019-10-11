import React, { useState } from 'react'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import { Modal, Button, Text, Icon } from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section } from './'

const alea = new Alea('modals')
const ipsum = loremIpsum({ units: 'sentences', count: 4, random: alea })

const modals = {
  default: {
    title: 'Default Modal',
  },
  dismissIcon: {
    title: 'Dismiss Icon',
    dismissChild: (
      <Icon sizeVariant="tiny">
        <CloseSvg />
      </Icon>
    ),
  },
  secondaryChildText: {
    title: 'Secondary Child',
    dismissChild: 'Save',
    secondaryChild: 'Cancel',
  },
  secondaryChildIcon: {
    title: 'Secondary Child Icon',
    secondaryChild: (
      <Icon sizeVariant="tiny">
        <AuthorSvg />
      </Icon>
    ),
  },
}

export default () => {
  const [visible, setVisible] = useState(false)
  const [modal, setModal] = useState('default')

  return (
    <Section title="Modals">
      {Object.keys(modals).map(key => (
        <Button
          onPress={() => {
            setModal(key)
            setVisible(true)
          }}
        >
          {modals[key].title}
        </Button>
      ))}
      <Modal
        visible={visible}
        onDismiss={() => setVisible(false)}
        paddingVariant="medium"
        {...modals[modal]}
      >
        <Text>{ipsum}</Text>
      </Modal>
    </Section>
  )
}
