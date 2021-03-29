import ora from 'ora'
import ServerProcess from './ServerProcess'

export function run(job: ServerProcess) {
  const spinner = ora(job.name)
  job.on('end', () => {
    spinner.stop()
    process.exit()
  })
  job.on('stdout', (msg) => {
    console.log(msg)
  })
  job.on('stderr', (msg) => {
    console.error(msg)
  })
  spinner.start()
  job.run()
}
