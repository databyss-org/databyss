import React from 'react'
import { View, Text, Grid, BaseControl } from '@databyss-org/ui/primitives'
import { darkTheme } from '@databyss-org/ui/theming/theme'

// follows react-dnd "simple" example, but using draggable BaseControls and Views as dropzones

const Dropzone = ({ dark }: { dark?: boolean }) => (
  <View
    bg="background.0"
    paddingVariant="small"
    width={250}
    height={250}
    m="small"
    alignItems="center"
    justifyContent="center"
    dropzone={{
      accepts: `DraggableBox${dark ? 'Dark' : ''}`,
      onDrop: (item) => {
        console.log('dropped', item)
      },
    }}
    {...(dark ? { theme: darkTheme } : {})}
  >
    <Text>Drop items here</Text>
  </View>
)

const DraggableBox = ({ name, dark }: { name: string; dark?: boolean }) => (
  <BaseControl
    draggable={{ type: `DraggableBox${dark ? 'Dark' : ''}`, payload: name }}
  >
    <View
      borderVariant="thinLight"
      paddingVariant="small"
      m="small"
      bg="background.0"
      {...(dark ? { theme: darkTheme } : {})}
    >
      <Text>{name}</Text>
    </View>
  </BaseControl>
)

export const SimpleDragAndDropSystem = () => (
  <Grid>
    <View>
      <DraggableBox dark name="Glass" />
      <DraggableBox dark name="Banana" />
      <DraggableBox dark name="Pear" />
      <DraggableBox name="Glass" />
      <DraggableBox name="Banana" />
      <DraggableBox name="Pear" />
    </View>
    <View>
      <Dropzone dark />
      <Dropzone />
    </View>
  </Grid>
)
