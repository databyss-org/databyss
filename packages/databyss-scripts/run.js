// import CopyDatabase from './dba/CopyDatabase'

const scriptMap = {
  'copy-database': [
    'dba/CopyDatabase',
    a => ({
      fromEnv: a[0],
      toEnv: a[1],
    }),
  ],
  'copy-page': ['dba/CopyPage', ['envName', 'pageId', 'toAccountId']],
}

function usageArgs(jobArgList) {
  return jobArgList.map(a => `<${a}>`).join(' ')
}

function run(args) {
  const _scriptName = args[2]
  if (!_scriptName) {
    console.log('Usage: yarn script <script-name> <parameters>')
    process.exit(1)
  }
  const [_jobFile, _jobArgList] = scriptMap[_scriptName]
  const Job = require(`./${_jobFile}`).default
  const _args = args.slice(3)
  if (_args.length !== _jobArgList.length) {
    console.log(`Usage: yarn script ${_scriptName} ${usageArgs(_jobArgList)}`)
    process.exit(1)
  }
  const _jobArgs = _jobArgList.reduce((_acc, _curr, _idx) => {
    _acc[_curr] = _args[_idx]
    return _acc
  }, {})
  console.log(_scriptName, _jobArgs)
  const job = new Job(_jobArgs)
  job.on('end', () => {
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

run(process.argv)
