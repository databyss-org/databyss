import fs from 'fs'
import path from 'path'
import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'
import { SysGroup, SysUser } from '@databyss-org/data/interfaces'
import { RestoreDb } from './RestoreDb'
import { parseCouchExportList } from '../../lib/util'

export class Restore extends ServerProcess {
  user: SysUser | null = null
  groups: SysGroup[] = []

  constructor(argv: ServerProcessArgs) {
    super(argv, 'restore')
  }
  async run() {
    let _dbs

    // if --email is provided, only restore dbs belonging to that user
    if (this.args.email) {
      this.user = getUserFromJson(this.args.path, this.args.email)
      this.logInfo('Restoring user with _id', this.user?._id)
      this.groups = getGroupsFromJson(this.args.path, this.user!._id)
      _dbs = this.groups.map((_g) => _g._id)
    } else {
      _dbs = fs.readdirSync(this.args.path)
    }
    for (const _db of _dbs) {
      const _dbName = _db.replace('.json', '')
      const _restore = new RestoreDb({
        ...this.args,
        dbName: _dbName,
        path: path.join(this.args.path, `${_dbName}.json`),
        spinner: this.spinner,
      })
      await _restore.run()
      await sleep(100)
    }

    if (this.user) {
      // if --email is provided, restore the group documents
      for (const _group of this.groups) {
        try {
          await cloudant.models.Groups.upsert(_group._id, (oldDoc) => {
            if (oldDoc && !this.args.replace) {
              this.logFailure('Group doc exists and --replace not set')
              return oldDoc
            }
            return removeRevisionFields(_group)
          })
        } catch (err) {
          this.logFailure('Restore group doc failed', err)
        }
        this.logSuccess('Restored group doc', _group._id)
        await sleep(100)
      }
      // and the user doc
      try {
        await cloudant.models.Users.upsert(this.user._id, (oldDoc) => {
          if (oldDoc && !this.args.replace) {
            this.logFailure('User doc exists and --replace not set')
            return oldDoc
          }
          return removeRevisionFields(this.user!)
        })
      } catch (err) {
        this.logFailure('Restore group doc failed', err)
      }
      this.logSuccess('Restored user doc', this.user._id)
    }
  }
}

/**
 * Gets a user from a JSON file
 * @param backupDir Path to directory containing the `users.json` backup file
 * @param email user's email address
 * @returns SysUser object
 */
export function getUserFromJson(
  backupDir: string,
  email: string
): SysUser | null {
  const _users = parseCouchExportList(
    fs.readFileSync(path.join(backupDir, 'users.json')).toString()
  ) as SysUser[]
  const _userMatches = _users.filter((_u) => _u.email === email)
  if (!_userMatches?.length) {
    return null
  }
  if (_userMatches.length > 1) {
    throw new Error(
      `[getUserFromJson] found more than one user matching email ${email}`
    )
  }
  return _userMatches[0]
}

/**
 * Given a string @text with line breaks, where there is one JSON array per line,
 * returns a merged array with all the entries from the file.
 * Example: mergeJsonArrayLines('['a', 'b']\n['c'])
 * returns: ['a', 'b', 'c']
 * @param text File contents
 */
export function jsonParseMultilineArray(text: string) {
  const _lines = text.split('\n')
  return _lines.reduce((arr, line) => {
    if (!line.length) {
      return arr
    }
    return arr.concat(JSON.parse(line))
  }, [])
}

/**
 * Get the groups that belong to a user
 * @param backupDir Path to directory containing the 'group.json' backup file
 * @param userId user _id
 * @returns array of SysGroup objects belonging to the user
 */
export function getGroupsFromJson(
  backupDir: string,
  userId: string
): SysGroup[] {
  const _groups = jsonParseMultilineArray(
    fs.readFileSync(path.join(backupDir, 'groups.json')).toString()
  ) as SysGroup[]
  return _groups.filter((_g) => _g.belongsToUserId === userId)
}

export function removeRevisionFields(doc: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _rev, _revisions, ..._fields } = doc
  return _fields
}

exports.command = 'instance [options]'
exports.desc = 'Restore an entire instance'
exports.builder = (yargs: ServerProcessArgs) =>
  yargs.example(
    '$0 restore instance --path ../backups/production',
    'Restore instance from `../backups/production`'
  )
exports.handler = (argv: ServerProcessArgs) => {
  new Restore(argv).runCli()
}
