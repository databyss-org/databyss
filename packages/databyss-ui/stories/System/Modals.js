import React, { useState } from 'react'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import { Modal, Button, Text, Icon, Dialog } from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section, TextControls } from './'
import { isMobileOs } from '../../lib/mediaQuery'

const alea = new Alea('modals')
const ipsum = loremIpsum({ units: 'paragraphs', count: 1, random: alea })

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

const dialogs = {
  ok: {
    name: 'Ok Dialog',
    message: ipsum,
    confirmButton: <Button variant="secondaryUi">Ok</Button>,
  },
}

export default () => {
  const [visible, setVisible] = useState(false)
  const [modal, setModal] = useState('default')

  return (
    <Section title="Modals">
      {Object.keys(modals).map(key => (
        <Button
          key={key}
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
        <Text>
          {ipsum}
          {ipsum}
        </Text>
      </Modal>
    </Section>
  )
}

const editableModals = {
  default: {
    title: 'Editable Modal',
  },
}

export const Editable = () => {
  const [visible, setVisible] = useState(false)
  const [modal, setModal] = useState('default')

  return (
    <Section title="Modals (editable content)">
      {Object.keys(editableModals).map(key => (
        <Button
          key={key}
          onPress={() => {
            setModal(key)
            setVisible(true)
          }}
        >
          {editableModals[key].title}
        </Button>
      ))}
      <Modal
        visible={visible}
        onDismiss={() => setVisible(false)}
        paddingVariant={isMobileOs() ? 'small' : 'large'}
        {...editableModals[modal]}
      >
        <TextControls />
        <TextControls />
        <TextControls />
        <TextControls />
        <TextControls />
      </Modal>
    </Section>
  )
}

export const Dialogs = () => {
  const [visible, setVisible] = useState(false)
  const [dialog, setDialog] = useState('ok')

  return (
    <Section title="Dialogs">
      {Object.keys(dialogs).map(key => (
        <Button
          key={key}
          onPress={() => {
            setDialog(key)
            setVisible(true)
          }}
        >
          {dialogs[key].name}
        </Button>
      ))}
      <Dialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        {...dialogs[dialog]}
      />
    </Section>
  )
}
