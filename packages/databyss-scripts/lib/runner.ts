import ora from 'ora'
import ServerProcess from './ServerProcess'

export function run(job: ServerProcess) {
  const spinner = ora(`[${job.name}] `)
  job.on('end', (success) => {
    spinner.stop()
    process.exit(success ? 0 : 1)
  })
  job.on('stdout', (msg) => {
    console.log(msg)
  })
  job.on('stderr', (msg) => {
    console.error(msg)
  })
  spinner.start()
  job
    .run()
    .then(() => process.exit())
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
