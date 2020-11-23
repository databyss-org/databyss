import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text, List, Button, Grid } from '@databyss-org/ui/primitives'
import { create, DatabyssDatabase } from '@databyss-org/data/db/create'
import { GroupDocType } from '@databyss-org/data/schemas/group'
import { uid } from '@databyss-org/data/lib/uid'

import { ViewportDecorator } from '../decorators'

const DataPocDemo = () => {
  const [db, setDb] = useState<DatabyssDatabase>()
  const [groups, setGroups] = useState<GroupDocType[]>()

  const listGroups = () => {
    db?.groups.find().$.subscribe((_groups) => {
      if (!_groups) {
        return
      }
      console.dir(_groups)
      _groups?.forEach((group) => {
        console.log(group.toJSON())
      })
      setGroups(_groups)
    })
  }
  const addGroup = () => {
    const _uid = uid()
    db?.groups.insert({
      _id: _uid,
      name: `test group ${_uid}`,
      users: [],
      defaultPageId: 'foo',
    })
  }

  useEffect(() => {
    const init = async () => {
      setDb(await create())
    }
    init()
  }, [])
  console.log('state.groups', groups)
  return (
    <Grid>
      <View>
        <Button onPress={() => addGroup()}>Add Group</Button>
        <Button onPress={() => listGroups()}>List Groups</Button>
      </View>
      <View>
        {groups?.map((group) => (
          <Text>Group: {group.name}</Text>
        ))}
      </View>
    </Grid>
  )
}

storiesOf('Data|POC', module)
  .addDecorator(ViewportDecorator)
  .add('default', () => <DataPocDemo />)
