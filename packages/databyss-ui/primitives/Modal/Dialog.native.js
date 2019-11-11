import React from 'react'
import { Modal as NativeModal } from 'react-native'
import { View } from '../'
import { borderRadius } from '../../theming/theme'
import DialogView from './DialogView'

const Dialog = ({ visible, ...others }) => (
  <NativeModal
    visible={visible}
    transparent
    supportedOrientations={[
      'portrait',
      'portrait-upside-down',
      'landscape',
      'landscape-left',
      'landscape-right',
    ]}
  >
    <View height="100%" justifyContent="center" alignItems="center">
      <View
        flex={1}
        position="absolute"
        left="0"
        right="0"
        top="0"
        bottom="0"
        bg="black"
        opacity={0.35}
      />
      <DialogView
        maxWidth="80%"
        widthVariant="dialog"
        backgroundColor="background.0"
        borderRadius={borderRadius}
        shadowVariant="modal"
        {...others}
      />
    </View>
  </NativeModal>
)

export default Dialog
