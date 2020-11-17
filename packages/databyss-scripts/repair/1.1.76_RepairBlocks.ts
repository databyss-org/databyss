import Block from '@databyss-org/api/src/models/Block'
import { Block as BlockType } from '@databyss-org/services/interfaces'
import Page from '@databyss-org/api/src/models/Page'
import { connectDB, closeDB } from '@databyss-org/api/src/lib/db'
import ServerProcess from '../lib/ServerProcess'
import { getEnv } from '../lib/util'

interface EnvDict {
  [key: string]: string
}

interface JobArgs {
  envName: string
}

class RepairBlocks extends ServerProcess {
  args: JobArgs
  fromDb: string | undefined
  env: EnvDict

  constructor(args: JobArgs) {
    super()
    this.args = args
    this.env = getEnv(args.envName)
  }
  async run() {
    this.emit('stdout', `Finding blocks with type 'END_* and fixing them`)

    try {
      connectDB(this.env.API_MONGO_URI)
      const _repaired = await repair()
      this.emit('stdout', `✅ Fixed ${_repaired} blocks`)
      this.emit('end', true)
    } catch (err) {
      this.emit('stderr', err)
      this.emit('end', false)
    } finally {
      await closeDB()
    }
  }
}

async function repair() {
  let _repairCount = 0
  const _badBlocks = await Block.find({ type: { $regex: /^END_/ } })
  console.log(`Found ${_badBlocks.length} bad blocks`)
  for (const _badBlock of _badBlocks) {
    console.log(`Fixing ${_badBlock._id}`)
    // extract atomic type
    const _openerType = _badBlock.type.substring(4)
    console.log(`Opener type: ${_openerType}`)
    // find the block in pages collection
    const _pages = await Page.find({ 'blocks._id': _badBlock._id })
    for (const _page of _pages) {
      // find the closing atomic block in the blocks array
      const _openerIndex = _page.blocks.findIndex(
        (b: BlockType) => b._id.toString() === _badBlock._id.toString()
      )
      let _closerIndex = -1
      for (let _i = _openerIndex + 1; _i < _page.blocks.length; _i += 1) {
        if (_page.blocks[_i].type === `END_${_openerType}`) {
          _closerIndex = _i
          break
        }
      }
      if (_closerIndex === -1) {
        console.log(`⚠️ no close block found in page: ${_page._id}`)
        continue
      }
      _page.blocks[_closerIndex]._id = _page.blocks[_openerIndex]._id
      await _page.save()
      console.log(`😀 Fixed END_${_openerType} in ${_page._id}`)
    }
    console.log(`Fixing type and name on ${_badBlock._id}`)
    _badBlock.text.textValue = _badBlock.text.textValue.substring(3)
    _badBlock.type = _openerType
    // console.log(_badBlock)
    await _badBlock.save()
    console.log(`✅ Fixed ${_badBlock._id}`)
    _repairCount += 1
  }
  return _repairCount
}

export default RepairBlocks
