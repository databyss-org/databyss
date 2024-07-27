import * as dbApi from './db-api'
import * as fileApi from './file-api'
import * as stateApi from './state-api'
import * as cmdApi from './cmd-api'
import * as pdfApi from './pdf-api'
import platformApi from './platform-api'
import * as publishApi from './publish-api'

export default {
  isDesktop: true,
  isWeb: false,
  db: dbApi,
  file: fileApi,
  state: stateApi,
  cmd: cmdApi,
  platform: platformApi,
  pdf: pdfApi,
  publish: publishApi,
}
