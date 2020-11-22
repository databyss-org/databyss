import React, { useState } from 'react'
import CloseSvg from '@databyss-org/ui/assets/close.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import {
  ModalWindow,
  Button,
  Text,
  Icon,
  Dialog,
} from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section, TextControls } from './'
import { isMobileOs } from '../../lib/mediaQuery'

const alea = new Alea('modals')
const ipsum = loremIpsum({ units: 'paragraphs', count: 2, random: alea })
const shortIpsum = loremIpsum({ units: 'sentences', count: 2, random: alea })

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
  ok: (onDismiss) => ({
    name: 'Ok Dialog',
    message: shortIpsum,
    onConfirm: onDismiss,
  }),
  nobtn: () => ({
    name: 'No Confirm Button',
    message: shortIpsum,
    showConfirmButtons: false,
  }),
  error: () => ({
    name: 'Error Dialog',
    message: '😱 So sorry, but Databyss has encountered an error.',
    confirmButtons: [
      <Button
        key="help"
        variant="uiLink"
        alignItems="center"
        href="https://forms.gle/z5Jcp4WK8MCwfpzy7"
      >
        Support Request Form
      </Button>,
      <Button key="ok" onPress={() => window.location.reload()}>
        Refresh and try again
      </Button>,
    ],
  }),
}

export default () => {
  const [visible, setVisible] = useState(false)
  const [modal, setModal] = useState('default')

  return (
    <Section title="Modals">
      {Object.keys(modals).map((key) => (
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
      <ModalWindow
        visible={visible}
        onDismiss={() => setVisible(false)}
        {...modals[modal]}
      >
        <Text>
          {ipsum}
          {ipsum}
        </Text>
      </ModalWindow>
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
      {Object.keys(editableModals).map((key) => (
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
      <ModalWindow
        visible={visible}
        onDismiss={() => setVisible(false)}
        widthVariant="form"
        padding={isMobileOs() ? 'none' : 'small'}
        {...editableModals[modal]}
      >
        {Array(5)
          .fill()
          .map((_, idx) => (
            <TextControls
              key={idx}
              listProps={{
                horizontalItemPadding: isMobileOs() ? 'none' : 'small',
              }}
              labelProps={{ paddingLeft: isMobileOs() ? 'em' : 'tiny' }}
            />
          ))}
      </ModalWindow>
    </Section>
  )
}

export const Dialogs = () => {
  const [visible, setVisible] = useState(false)
  const [dialog, setDialog] = useState('ok')

  return (
    <Section title="Dialogs">
      {Object.keys(dialogs).map((key) => (
        <Button
          key={key}
          onPress={() => {
            setDialog(key)
            setVisible(true)
          }}
        >
          {dialogs[key]().name}
        </Button>
      ))}
      <Dialog visible={visible} {...dialogs[dialog](() => setVisible(false))} />
    </Section>
  )
}
