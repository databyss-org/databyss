import React, { useState, useEffect } from 'react'
import * as PouchDB from 'pouchdb'
import { storiesOf } from '@storybook/react'
import { View, Text, List, Button, Grid } from '@databyss-org/ui/primitives'
import { create } from '@databyss-org/data/db/create'
// import { GroupDocType } from '@databyss-org/data/schemas/group'
import { uid } from '@databyss-org/data/lib/uid'

import { ViewportDecorator } from '../decorators'

const DataPocDemo = () => {
  const [db, setDb] = useState<PouchDB.Database>()
  const [groups, setGroups] = useState<any>()
  const [blocks, setBlocks] = useState<any>()

  const listGroups = async () => {
    const _docs = await db?.find({
      selector: {
        $type: 'group',
      },
    })
    console.log('listBlocks', _docs)
    setGroups(_docs?.docs)
  }
  const addGroup = () => {
    const _uid = uid()
    db?.put({
      _id: _uid,
      $type: 'group',
      name: `test group ${_uid}`,
      users: [],
      defaultPageId: 'foo',
    })
  }

  const addBlock = () => {
    const _uid = uid()
    db?.put({
      _id: _uid,
      $type: 'block',
      text: {
        textValue: `test block ${_uid}`,
        ranges: [],
      },
      groupId: '???',
      sharedWithGroupIds: [],
    })
  }
  const listBlocks = async () => {
    const _docs = await db?.find({
      selector: {
        $type: 'block',
      },
    })
    console.log('listBlocks', _docs)
    setBlocks(_docs?.docs)
  }

  useEffect(() => {
    const init = async () => {
      setDb(await create())
    }
    init()
  }, [])

  const updateLists = () => {
    listGroups()
    listBlocks()
  }

  useEffect(() => {
    db?.changes({
      since: 'now',
      live: true,
    }).on('change', updateLists)
  }, [db])

  return (
    <Grid>
      <View>
        <Button onPress={() => addGroup()}>Add Group</Button>
        <Button onPress={() => listGroups()}>List Groups</Button>
        <hr />
        <Button onPress={() => addBlock()}>Add Block</Button>
        <Button onPress={() => listBlocks()}>List Blocks</Button>
      </View>
      <View>
        <h2>Groups</h2>
        {groups?.map((group) => (
          <Text key={group._id}>Group: {group.name}</Text>
        ))}
      </View>
      <View>
        <h2>Blocks</h2>
        {blocks?.map((block) => (
          <Text key={block._id}>block: {block.text?.textValue}</Text>
        ))}
      </View>
    </Grid>
  )
}

storiesOf('Data|POC', module)
  .addDecorator(ViewportDecorator)
  .add('pouchdb', () => <DataPocDemo />)
