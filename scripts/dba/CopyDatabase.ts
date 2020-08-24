import ServerProcess from '../lib/ServerProcess'
import { getEnv } from '../lib/util'

interface envDict {
  [key: string]: string
}

class CopyDatabase extends ServerProcess {
  fromEnv: envDict
  toEnv: envDict

  constructor({
    fromEnv,
    toEnv,
    ...others
  }: {
    fromEnv: string
    toEnv: string
  }) {
    super(others)
    this.fromEnv = getEnv(fromEnv)
    this.toEnv = getEnv(toEnv)
  }
  async run() {
    // const dumpCmd = `mongodump --host ${DB_CLUSTER_URI_LIVE} --ssl --username ${DB_USER} --password ${DB_PASSWORD} --authenticationDatabase admin --db ${DB_NAME} --out ${DB_DUMP_PATH}`
    // const restoreCmd = `mongorestore --host ${DB_CLUSTER_URI_BETA} --ssl --username ${DB_USER} --password ${DB_PASSWORD} --authenticationDatabase admin --drop ${DB_DUMP_PATH}`

    try {
      this.emit('stdout', 'DUMPING DATA...')
      // this.emit('stdout', 'DUMPING DATA...')
      // await this.exec(dumpCmd)
      // this.emit('stdout', 'RESTORING DATA...')
      // await this.exec(restoreCmd)
      // this.emit('end', true)
    } catch (err) {
      console.error(err)
      this.emit('end', false)
    }
  }
}

export default CopyDatabase

if (require.main === module) {
  const job = new jobDatabase()
  job.on('end', success => {
    process.exit()
  })
  job.on('stdout', msg => {
    console.log(msg)
  })
  job.on('stderr', msg => {
    console.error(msg)
  })
  job.run()
}
