import React, { useState, useEffect, FunctionComponent } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import * as PouchDB from 'pouchdb'
import { storiesOf } from '@storybook/react'
import { View, Text, Button, Grid } from '@databyss-org/ui/primitives'
import { create } from '@databyss-org/data/appdb/create'
// import { GroupDocType } from '@databyss-org/data/schemas/group'
import { uid } from '@databyss-org/data/lib/uid'

import { ViewportDecorator } from '../decorators'

type DemoProps = {
  groupIds: string[]
}

const DataPocDemo: FunctionComponent<DemoProps> = ({ groupIds }) => {
  const [db, setDb] = useState<PouchDB.Database>()
  // const [groups, setGroups] = useState<any>()
  const [blocks, setBlocks] = useState<any>()

  // const listGroups = async () => {
  //   const _docs = await db?.find({
  //     selector: {
  //       $type: 'group',
  //     },
  //   })
  //   console.log('listBlocks', _docs)
  //   setGroups(_docs?.docs)
  // }

  // const addGroup = () => {
  //   const _uid = uid()
  //   db?.put({
  //     _id: _uid,
  //     $type: 'group',
  //     name: `test group ${_uid}`,
  //     users: [],
  //     defaultPageId: 'foo',
  //   })
  // }

  const addBlock = (groupId: string) => {
    const _uid = uid()
    db?.put({
      _id: _uid,
      $type: 'block',
      text: {
        textValue: `test block ${_uid}`,
        ranges: [],
      },
      groupId,
      sharedWithGroupIds: [],
    })
  }
  const listBlocks = async () => {
    const _docs = await db?.find({
      selector: {
        $type: 'block',
        groupId: { $in: groupIds },
      },
    })
    console.log('listBlocks', _docs)
    setBlocks(_docs?.docs)
  }

  useEffect(() => {
    const init = async () => {
      setDb(await create(groupIds))
    }
    init()
  }, [])

  const updateLists = () => {
    // listGroups()
    listBlocks()
  }

  useEffect(() => {
    db?.changes({
      since: 'now',
      live: true,
    }).on('change', updateLists)
    updateLists()
  }, [db])

  return (
    <Grid>
      {groupIds.map((gid) => (
        <Grid key={gid}>
          <View>
            <Button onPress={() => addBlock(gid)}>Add Block to {gid}</Button>
          </View>
          <View>
            <h2>{gid}</h2>
            {blocks
              ?.filter((b) => b.groupId === gid)
              .map((b) => (
                <Text key={b._id}>Block: {b.text?.textValue}</Text>
              ))}
          </View>
        </Grid>
      ))}
    </Grid>
  )
}

storiesOf('Data|POC', module)
  .addDecorator(ViewportDecorator)
  .add('groups: A,B', () => <DataPocDemo groupIds={['A', 'B']} />)
  .add('groups: B', () => <DataPocDemo groupIds={['B']} />)
  .add('cloudant: test_group_a', () => (
    <DataPocDemo groupIds={['test_group_a']} />
  ))
