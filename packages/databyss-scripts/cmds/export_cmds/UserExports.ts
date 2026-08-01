import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import AWS from 'aws-sdk'
import fetch from 'node-fetch'
import JSZip from 'jszip'
import cloneDeep from 'clone-deep'
import { cloudant } from '@databyss-org/data/cloudant/cloudant'
import {
  DbDocument,
  DocumentType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { Role } from '@databyss-org/data/interfaces/sysUser'
import {
  bibliographyToMarkdown,
  blockToMarkdown,
  cleanFilename,
  sourceToMarkdown,
} from '@databyss-org/services/markdown'
import { getCitationStyle } from '@databyss-org/services/citations/lib'
import { DefaultCitationStyleId } from '@databyss-org/services/citations/constants/CitationStyles'
import { toCitation } from '@databyss-org/services/citations'
import {
  Block,
  BlockType,
  Document,
  DocumentDict,
  Embed,
  Page,
  Source,
} from '@databyss-org/services/interfaces'
import { validUriRegex } from '@databyss-org/services/lib/util'
import {
  ServerProcess,
  ServerProcessArgs,
  sleep,
} from '@databyss-org/scripts/lib'

type DbDocAny = DbDocument & { [key: string]: any }

interface ExportUser {
  _id?: string
  userId?: string
  email?: string
  defaultGroupId?: string
}

interface DriveConfig {
  host: string
  rootSecret: string
}

interface PublicS3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

interface PostmarkConfig {
  apiKey: string
  from: string
}

function fixedEncodeURIComponent(str: string) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`
  )
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

function userDirName(user: ExportUser) {
  return user._id ?? user.userId ?? user.email ?? `unknown-${Date.now()}`
}

function toDocsById(docs: DbDocAny[]) {
  return docs.reduce((acc, doc) => {
    if (doc && doc._id) {
      acc[doc._id] = doc as Document
    }
    return acc
  }, {} as DocumentDict<Document>)
}

export class UserExports extends ServerProcess {
  private didLogDriveHostWarning = false
  private didLogDriveSecretWarning = false

  constructor(argv: ServerProcessArgs) {
    super(argv, 'export.users')
  }

  async run() {
    const runDatabyss = !!(this.args.full || this.args.databyss)
    const runMarkdown = !!(this.args.full || this.args.markdown)
    const runUpload = !!(this.args.full || this.args.upload)
    const runEmail = !!(this.args.full || this.args.email)

    if (!runDatabyss && !runMarkdown && !runUpload && !runEmail) {
      throw new Error(
        '[export.users] specify at least one mode: --databyss, --markdown, --upload, --email, or --full'
      )
    }

    const needsDocs = runDatabyss || runMarkdown

    const outputRoot = path.join(process.cwd(), 'out', 'exports')
    fs.mkdirSync(outputRoot, { recursive: true })

    const users = await this.getUsers()
    this.logInfo('Users to export:', users.length)

    let exported = 0
    for (const user of users) {
      const groupId = user.defaultGroupId
      if (needsDocs && !groupId) {
        this.logWarning('Skipping user without defaultGroupId', user.email)
        continue
      }

      const userOutputDir = path.join(outputRoot, userDirName(user))
      fs.mkdirSync(userOutputDir, { recursive: true })

      if (needsDocs || runUpload) {
        fs.writeFileSync(
          path.join(userOutputDir, 'user.json'),
          JSON.stringify(user, null, 2)
        )
      }

      this.logInfo('Processing user', user.email ?? user._id, groupId)

      let databyssZip: Buffer | undefined
      let markdownZip: Buffer | undefined

      if (needsDocs && groupId) {
        let docs = await this.getGroupDocs(groupId)
        docs = docs.filter((d) => !!d)

        if (runDatabyss) {
          databyssZip = await this.buildDatabyssZip({
            docs,
            defaultGroupId: groupId,
          })
          fs.writeFileSync(
            path.join(userOutputDir, 'databyss.zip'),
            databyssZip
          )
        }

        if (runMarkdown) {
          markdownZip = await this.buildMarkdownZip({
            docs,
            defaultGroupId: groupId,
          })
          fs.writeFileSync(
            path.join(userOutputDir, 'markdown.zip'),
            markdownZip
          )
        }
      }

      let rootUrl: string | null = null

      if (runUpload) {
        rootUrl = await this.uploadUserExports({
          user,
          userOutputDir,
          databyssZip,
          markdownZip,
        })
        this.logSuccess('Public export URL root:', rootUrl)
      }

      if (runEmail) {
        if (!user.email) {
          throw new Error(
            `[export.users] cannot send email: missing user email for ${userDirName(
              user
            )}`
          )
        }

        const emailRootUrl = rootUrl ?? this.getPublicExportRootUrl(user)
        await this.sendMigrationEmail({
          to: user.email,
          databyssDataUrl: `${emailRootUrl}/databyss.zip`,
          markdownDataUrl: `${emailRootUrl}/markdown.zip`,
        })
        this.logSuccess('Sent migration email to', user.email)
      }

      exported += 1
      if (this.args.delay) {
        await sleep(Number(this.args.delay))
      }
    }

    this.logSuccess('Finished exports:', exported)
    this.logSuccess('Output root:', outputRoot)
  }

  private getDriveConfig(): DriveConfig {
    const envDefaultDriveHost =
      this.args.envName === 'test'
        ? 'drive-beta.databyss.cloud'
        : 'drive.databyss.cloud'

    const host =
      this.args.env.REACT_APP_DRIVE_HOST ??
      this.args.env.DRIVE_HOST ??
      process.env.REACT_APP_DRIVE_HOST ??
      process.env.DRIVE_HOST ??
      envDefaultDriveHost

    const rootSecret =
      this.args.env.DRIVE_ROOT_SECRET ??
      this.args.env.ROOT_SECRET ??
      process.env.DRIVE_ROOT_SECRET ??
      process.env.ROOT_SECRET

    if (!host) {
      throw new Error(
        '[export.users] missing drive host for upload mode (REACT_APP_DRIVE_HOST or DRIVE_HOST)'
      )
    }
    if (!rootSecret) {
      throw new Error(
        '[export.users] missing DRIVE_ROOT_SECRET (or ROOT_SECRET) for upload mode'
      )
    }

    return { host, rootSecret }
  }

  private getPublicS3ExportSalt() {
    const salt =
      this.args.env.PUBLIC_S3_EXPORT_SALT ?? process.env.PUBLIC_S3_EXPORT_SALT

    if (!salt) {
      throw new Error(
        '[export.users] missing PUBLIC_S3_EXPORT_SALT for upload/email mode'
      )
    }

    return String(salt)
  }

  private getPublicExportBaseUrl() {
    return (
      this.args.env.PUBLIC_EXPORT_BASE_URL ??
      process.env.PUBLIC_EXPORT_BASE_URL ??
      'https://public.databyss.cloud'
    ).replace(/\/+$/, '')
  }

  private getPostmarkConfig(): PostmarkConfig {
    const apiKey =
      this.args.env.API_POSTMARK_KEY ?? process.env.API_POSTMARK_KEY
    const from =
      this.args.env.API_TRANSACTIONAL_EMAIL_SENDER ??
      process.env.API_TRANSACTIONAL_EMAIL_SENDER

    if (!apiKey) {
      throw new Error(
        '[export.users] missing API_POSTMARK_KEY for --email mode'
      )
    }
    if (!from) {
      throw new Error(
        '[export.users] missing API_TRANSACTIONAL_EMAIL_SENDER for --email mode'
      )
    }

    return {
      apiKey,
      from,
    }
  }

  private async sendMigrationEmail({
    to,
    databyssDataUrl,
    markdownDataUrl,
  }: {
    to: string
    databyssDataUrl: string
    markdownDataUrl: string
  }) {
    if (process.env.NODE_ENV === 'test') {
      this.logInfo('[export.users] skipping email send in test env')
      return
    }

    const postmark = require('postmark')
    const { apiKey, from } = this.getPostmarkConfig()
    const client = new postmark.ServerClient(apiKey)

    await client.sendEmailWithTemplate({
      From: from,
      To: to,
      TemplateAlias: 'databyss_desktop_migration',
      TemplateModel: {
        databyss_data_url: databyssDataUrl,
        markdown_data_url: markdownDataUrl,
      },
    })
  }

  private getExportDirKey(user: ExportUser, salt: string) {
    const _userId = userDirName(user)
    const normalizedEmail = (user.email ?? '').trim().toLowerCase()
    const hashInput = normalizedEmail || _userId
    const _hash = crypto
      .createHash('sha256')
      .update(`${salt}:${hashInput}`)
      .digest('hex')
      .slice(0, 12)

    if (!normalizedEmail) {
      this.logWarning(
        `[export.users] user ${_userId} has no email; using user id for deterministic hash`
      )
    }

    return `${_userId}-${_hash}`
  }

  private getPublicExportRootUrl(user: ExportUser) {
    const exportSalt = this.getPublicS3ExportSalt()
    const exportDirKey = this.getExportDirKey(user, exportSalt)
    return `${this.getPublicExportBaseUrl()}/exports/${exportDirKey}`
  }

  private getPublicS3Configs(): PublicS3Config[] {
    const endpointRaw =
      this.args.env.PUBLIC_S3_ENDPOINT ?? process.env.PUBLIC_S3_ENDPOINT
    const accessKeyId =
      this.args.env.PUBLIC_S3_ID ?? process.env.PUBLIC_S3_ID ?? ''
    const secretAccessKey =
      this.args.env.PUBLIC_S3_SECRET ?? process.env.PUBLIC_S3_SECRET ?? ''

    if (!endpointRaw) {
      throw new Error(
        '[export.users] missing PUBLIC_S3_ENDPOINT for upload mode'
      )
    }
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        '[export.users] missing PUBLIC_S3_ID or PUBLIC_S3_SECRET for upload mode'
      )
    }

    const publicBaseUrl = this.getPublicExportBaseUrl()

    const endpoint = endpointRaw.replace(/\/+$/, '')
    const bucket =
      this.args.env.PUBLIC_S3_BUCKET ?? process.env.PUBLIC_S3_BUCKET

    if (!bucket) {
      throw new Error('[export.users] missing PUBLIC_S3_BUCKET for upload mode')
    }

    const endpointCandidates = unique([endpoint, publicBaseUrl])

    const configs: PublicS3Config[] = []
    endpointCandidates.forEach((_endpoint) => {
      configs.push({
        endpoint: _endpoint,
        accessKeyId,
        secretAccessKey,
        bucket,
        publicBaseUrl,
      })
    })

    return configs
  }

  private getPublicS3Client(config: PublicS3Config) {
    return new AWS.S3({
      endpoint: config.endpoint,
      region: 'us-east-1',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    })
  }

  private async uploadUserExports({
    user,
    userOutputDir,
    databyssZip,
    markdownZip,
  }: {
    user: ExportUser
    userOutputDir: string
    databyssZip?: Buffer
    markdownZip?: Buffer
  }) {
    const s3Configs = this.getPublicS3Configs()
    const rootUrl = this.getPublicExportRootUrl(user)
    const exportDirKey = rootUrl.split('/').pop() as string

    const userJsonPath = path.join(userOutputDir, 'user.json')
    const userJsonBuffer = this.getUploadBuffer({
      userOutputDir,
      filename: 'user.json',
      fallbackBuffer: fs.existsSync(userJsonPath)
        ? fs.readFileSync(userJsonPath)
        : undefined,
    })

    const files = [
      {
        filename: 'user.json',
        contentType: 'application/json',
        buffer: userJsonBuffer,
      },
      {
        filename: 'databyss.zip',
        contentType: 'application/zip',
        buffer: this.getUploadBuffer({
          userOutputDir,
          filename: 'databyss.zip',
          fallbackBuffer: databyssZip,
        }),
      },
      {
        filename: 'markdown.zip',
        contentType: 'application/zip',
        buffer: this.getUploadBuffer({
          userOutputDir,
          filename: 'markdown.zip',
          fallbackBuffer: markdownZip,
        }),
      },
    ]

    let lastError: Error | null = null
    for (const s3Config of s3Configs) {
      const s3 = this.getPublicS3Client(s3Config)
      try {
        for (const file of files) {
          const key = `exports/${exportDirKey}/${file.filename}`
          await this.uploadPublicS3File({
            s3,
            bucket: s3Config.bucket,
            key,
            contentType: file.contentType,
            buffer: file.buffer,
          })
        }

        this.logInfo(
          `[export.users] upload target endpoint=${s3Config.endpoint} bucket=${s3Config.bucket}`
        )
        return `${s3Config.publicBaseUrl}/exports/${exportDirKey}`
      } catch (err) {
        lastError = err as Error
        this.logWarning(
          `[export.users] upload failed endpoint=${s3Config.endpoint} bucket=${s3Config.bucket}: ${lastError.message}`
        )
      }
    }

    throw lastError ?? new Error('[export.users] public s3 upload failed')
  }

  private getUploadBuffer({
    userOutputDir,
    filename,
    fallbackBuffer,
  }: {
    userOutputDir: string
    filename: string
    fallbackBuffer?: Buffer
  }): Buffer {
    if (fallbackBuffer) {
      return fallbackBuffer
    }

    const filePath = path.join(userOutputDir, filename)
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `[export.users] missing ${filename} for upload in ${userOutputDir}. Run with --databyss/--markdown first or use --full.`
      )
    }

    return fs.readFileSync(filePath)
  }

  private async uploadPublicS3File({
    s3,
    bucket,
    key,
    contentType,
    buffer,
  }: {
    s3: AWS.S3
    bucket: string
    key: string
    contentType: string
    buffer: Buffer
  }) {
    try {
      await s3
        .putObject({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=0, must-revalidate',
        })
        .promise()
    } catch (err) {
      const _err = err as Error
      throw new Error(
        `[export.users] public s3 upload failed ${key}: ${_err.message}`
      )
    }
  }

  private async getUsers(): Promise<ExportUser[]> {
    if (this.args.user) {
      const res = await cloudant.models.Users.find({
        selector: { email: this.args.user },
      })
      return res.docs as ExportUser[]
    }

    const res = await cloudant.models.Users.list({ include_docs: true })
    return res.rows.map((r) => r.doc).filter((u) => !!u) as ExportUser[]
  }

  private async getGroupDocs(groupId: string): Promise<DbDocAny[]> {
    const db = cloudant.current.db.use(groupId)
    const res = await db.list({ include_docs: true })
    return res.rows.map((row: any) => row.doc as DbDocAny)
  }

  private sanitizeDocsForExport({
    docs,
    defaultGroupId,
  }: {
    docs: DbDocAny[]
    defaultGroupId: string
  }) {
    const _docs = docs.filter(
      (doc) =>
        !!doc &&
        typeof doc._id === 'string' &&
        !doc._id.startsWith('_design/') &&
        !doc._id.startsWith('_local/')
    )

    const prefsDoc = _docs.find(
      (doc) =>
        doc._id === 'user_preference' &&
        doc.doctype === DocumentType.UserPreferences
    ) as (UserPreference & { [key: string]: any }) | undefined

    const groupDocs = _docs.filter((doc) => doc.doctype === DocumentType.Group)
    const groupIds = new Set(groupDocs.map((g) => g._id))

    if (prefsDoc && groupDocs.length > 0) {
      const groups = Array.isArray(prefsDoc.groups)
        ? prefsDoc.groups.filter(
            (g: any) =>
              g && typeof g.groupId === 'string' && groupIds.has(g.groupId)
          )
        : []

      let belongsToGroup =
        typeof prefsDoc.belongsToGroup === 'string' &&
        groupIds.has(prefsDoc.belongsToGroup)
          ? prefsDoc.belongsToGroup
          : null

      if (!belongsToGroup) {
        belongsToGroup =
          groups[0]?.groupId ?? groupDocs[0]._id ?? defaultGroupId
      }

      const adminGroup = groups.find(
        (g: any) => g.groupId === belongsToGroup && g.role === Role.GroupAdmin
      )
      if (!adminGroup) {
        const existing = groups.find((g: any) => g.groupId === belongsToGroup)
        if (existing) {
          existing.role = Role.GroupAdmin
        } else {
          const firstPage = _docs.find(
            (doc) => doc.doctype === DocumentType.Page
          )
          groups.unshift({
            groupId: belongsToGroup,
            defaultPageId: firstPage?._id ?? '',
            role: Role.GroupAdmin,
          })
        }
      }

      prefsDoc.groups = groups
      prefsDoc.belongsToGroup = belongsToGroup
    }

    const exportGroupId =
      prefsDoc?.belongsToGroup ??
      defaultGroupId ??
      groupDocs[0]?._id ??
      docs[0]?.belongsToGroup

    return {
      docs: _docs,
      exportGroupId,
      groupIds: unique(
        [
          exportGroupId,
          defaultGroupId,
          ...(prefsDoc?.groups ?? []).map((g: any) => g.groupId),
        ].filter((v) => typeof v === 'string' && !!v)
      ) as string[],
    }
  }

  private async fetchDriveFile({
    storageKey,
    groupCandidates,
    src,
    filename,
  }: {
    storageKey: string
    groupCandidates: string[]
    src?: string
    filename?: string
  }): Promise<Buffer | null> {
    const envDefaultDriveHost =
      this.args.envName === 'test'
        ? 'drive-beta.databyss.cloud'
        : 'drive.databyss.cloud'
    const driveHost =
      this.args.env.REACT_APP_DRIVE_HOST ??
      this.args.env.DRIVE_HOST ??
      process.env.REACT_APP_DRIVE_HOST ??
      process.env.DRIVE_HOST ??
      envDefaultDriveHost
    const rootSecret =
      this.args.env.DRIVE_ROOT_SECRET ??
      this.args.env.ROOT_SECRET ??
      process.env.DRIVE_ROOT_SECRET ??
      process.env.ROOT_SECRET

    const urls: string[] = []
    const _groupCandidates = new Set(groupCandidates)
    let _effectiveStorageKey = storageKey

    if (src && /^https?:\/\//i.test(src)) {
      urls.push(src)
    }

    if (src?.startsWith('dbdrive://')) {
      const _parts = src.replace('dbdrive://', '').split('/')
      const _srcGroupId = _parts[0]
      const _srcFileId = _parts[1]
      if (_srcGroupId) {
        _groupCandidates.add(_srcGroupId)
      }
      if (_srcFileId) {
        _effectiveStorageKey = _srcFileId
      }
    }

    const _encodedFilename = filename
      ? fixedEncodeURIComponent(filename)
      : undefined

    if (driveHost && _effectiveStorageKey) {
      Array.from(_groupCandidates).forEach((groupId) => {
        const base = `https://${driveHost}/b/${groupId}/${_effectiveStorageKey}`
        urls.push(base)
        if (_encodedFilename) {
          urls.push(`${base}/${_encodedFilename}`)
        }
        if (rootSecret) {
          urls.push(`${base}?token=${encodeURIComponent(rootSecret)}`)
          if (_encodedFilename) {
            urls.push(
              `${base}/${_encodedFilename}?token=${encodeURIComponent(
                rootSecret
              )}`
            )
          }
        }
      })
    }

    if (!driveHost && !this.didLogDriveHostWarning) {
      this.didLogDriveHostWarning = true
      this.logWarning(
        'Drive host is missing. Set REACT_APP_DRIVE_HOST or DRIVE_HOST in your --env file to export drive media.'
      )
    }
    if (!rootSecret && !this.didLogDriveSecretWarning) {
      this.didLogDriveSecretWarning = true
      this.logWarning(
        'DRIVE_ROOT_SECRET is missing. Private drive media may fail to export.'
      )
    }

    const headers = rootSecret
      ? {
          Authorization: `Bearer ${rootSecret}`,
        }
      : undefined

    for (const url of unique(urls)) {
      const safeUrl = url.replace(/\?.*$/, '')
      try {
        const res = await fetch(url, { headers })
        if (!res.ok) {
          if (this.args.verbose) {
            this.logInfo('Drive fetch miss', res.status, safeUrl)
          }
          continue
        }
        const contentType = (
          res.headers.get('content-type') ?? ''
        ).toLowerCase()
        if (contentType.includes('text/html')) {
          if (this.args.verbose) {
            this.logInfo('Drive fetch returned html, skipping', safeUrl)
          }
          continue
        }
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > 0) {
          return buf
        }
      } catch {
        // try next candidate
      }
    }

    return null
  }

  private async buildDatabyssZip({
    docs,
    defaultGroupId,
  }: {
    docs: DbDocAny[]
    defaultGroupId: string
  }) {
    const zip = new JSZip()
    const {
      docs: exportDocs,
      exportGroupId,
      groupIds,
    } = this.sanitizeDocsForExport({
      docs: cloneDeep(docs),
      defaultGroupId,
    })

    for (const doc of exportDocs) {
      const embed = doc as any
      if (
        embed?.doctype !== DocumentType.Block ||
        embed?.type !== BlockType.Embed ||
        !embed?._id
      ) {
        continue
      }
      const fileDetail = embed?.detail?.fileDetail
      if (!fileDetail?.filename || !fileDetail?.storageKey) {
        continue
      }

      const fileBuf = await this.fetchDriveFile({
        storageKey: fileDetail.storageKey,
        groupCandidates: unique(
          [
            embed.belongsToGroup,
            exportGroupId,
            defaultGroupId,
            ...groupIds,
          ].filter((g) => typeof g === 'string' && !!g)
        ) as string[],
        src: embed?.detail?.src,
        filename: fileDetail.filename,
      })
      if (!fileBuf) {
        this.logWarning(
          'Drive media not fetched for embed',
          embed._id,
          fileDetail.storageKey,
          unique(
            [
              embed.belongsToGroup,
              exportGroupId,
              defaultGroupId,
              ...groupIds,
            ].filter((g) => typeof g === 'string' && !!g)
          ).join(',')
        )
        continue
      }

      const filename = fixedEncodeURIComponent(fileDetail.filename)
      zip.file(`media/${embed._id}/${filename}`, fileBuf, { binary: true })
      if (exportGroupId) {
        embed.detail.src = `dbdrive://${exportGroupId}/${embed._id}/${filename}`
      }
    }

    zip.file('db.json', JSON.stringify(exportDocs, null, 2))
    return zip.generateAsync({ type: 'nodebuffer' })
  }

  private async buildMarkdownZip({
    docs,
    defaultGroupId,
  }: {
    docs: DbDocAny[]
    defaultGroupId: string
  }) {
    const zip = new JSZip()
    const root = zip.folder('collection')!
    const {
      docs: exportDocs,
      exportGroupId,
      groupIds,
    } = this.sanitizeDocsForExport({
      docs: cloneDeep(docs),
      defaultGroupId,
    })

    const docsById = toDocsById(exportDocs)
    const pref = exportDocs.find(
      (d) =>
        d._id === 'user_preference' &&
        d.doctype === DocumentType.UserPreferences
    ) as UserPreference | undefined

    const styleId = pref?.preferredCitationStyle ?? DefaultCitationStyleId
    const citationStyle =
      getCitationStyle(styleId) ?? getCitationStyle(DefaultCitationStyleId)

    const sourceDocs = (exportDocs.filter(
      (d) => d.doctype === DocumentType.Block && d.type === BlockType.Source
    ) as unknown) as Source[]

    const bibliographyItems = await Promise.all(
      sourceDocs.map(async (source) => ({
        source,
        citation: source.detail
          ? await toCitation(source.detail, { styleId: citationStyle?.id })
          : source.text?.textValue,
      }))
    )

    root.file(
      's/@bibliography.md',
      bibliographyToMarkdown({
        bibliography: bibliographyItems as any,
        citationStyle,
      })
    )

    const linkedDocs: DocumentDict<Document> = {}
    const pages = (exportDocs.filter(
      (d) => d.doctype === DocumentType.Page && !d.archive
    ) as unknown) as Page[]

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const page = pages[pageIndex]
      if (pageIndex > 0 && pageIndex % 25 === 0) {
        this.logInfo(
          `Markdown export progress: ${pageIndex}/${pages.length} pages`
        )
      }
      if (pageIndex % 10 === 0) {
        await sleep(0)
      }

      const blocks = (page.blocks ?? [])
        .map((b: any) => docsById[b._id] ?? b)
        .filter((b: any) => !!b && !!b.text)

      const linkedIds = new Set<string>()
      blocks.forEach((block: any) => {
        if (block?._id) {
          linkedIds.add(block._id)
        }
        block?.text?.ranges?.forEach((range: any) => {
          range?.marks?.forEach((mark: any) => {
            if (
              Array.isArray(mark) &&
              mark.length > 1 &&
              mark[1] &&
              !mark[1].match(validUriRegex)
            ) {
              linkedIds.add(mark[1])
            }
          })
        })
      })

      linkedIds.forEach((id) => {
        if (docsById[id]) {
          linkedDocs[id] = docsById[id]
        }
      })

      await this.rewriteMarkdownEmbedMedia({
        linkedDocuments: linkedDocs,
        zip: root,
        groupCandidates: unique(
          [exportGroupId, defaultGroupId, ...groupIds].filter(
            (g) => typeof g === 'string' && !!g
          )
        ) as string[],
      })

      const markdown = blocks
        .map((block: Block, idx: number) =>
          blockToMarkdown({
            block,
            linkedDocs,
            isTitle: idx === 0,
          })
        )
        .join('\n\n')

      root.file(`${cleanFilename(page.name)}.md`, markdown)
      await this.exportLinkedDocuments({
        documents: linkedDocs,
        zip: root,
        citationStyleId: citationStyle?.id,
      })
    }

    return zip.generateAsync({ type: 'nodebuffer' })
  }

  private async rewriteMarkdownEmbedMedia({
    linkedDocuments,
    zip,
    groupCandidates,
  }: {
    linkedDocuments: DocumentDict<Document>
    zip: JSZip
    groupCandidates: string[]
  }) {
    let _embedCount = 0
    for (const doc of Object.values(linkedDocuments)) {
      const embed = (doc as unknown) as Embed
      if (!embed || embed.type !== BlockType.Embed) {
        continue
      }
      _embedCount += 1
      if (_embedCount % 25 === 0) {
        await sleep(0)
      }

      const fileDetail = embed?.detail?.fileDetail
      if (!embed?._id || !fileDetail?.filename || !fileDetail?.storageKey) {
        continue
      }
      if (embed.detail?.src?.startsWith('media/')) {
        continue
      }

      const fileBuf = await this.fetchDriveFile({
        storageKey: fileDetail.storageKey,
        groupCandidates,
        src: embed.detail?.src,
        filename: fileDetail.filename,
      })
      if (!fileBuf) {
        continue
      }

      const filename = fixedEncodeURIComponent(fileDetail.filename)
      const relativePath = `media/${embed._id}/${filename}`
      zip.file(relativePath, fileBuf, { binary: true })
      embed.detail.src = relativePath
    }
  }

  private async exportLinkedDocuments({
    documents,
    zip,
    citationStyleId,
  }: {
    documents: DocumentDict<Document>
    zip: JSZip
    citationStyleId?: string
  }) {
    for (const doc of Object.values(documents)) {
      if (!doc || (doc as any).doctype !== DocumentType.Block) {
        continue
      }
      const block = (doc as unknown) as Block
      if (block.type === BlockType.Topic) {
        zip.file(
          `t/${cleanFilename(block.text.textValue)}.md`,
          `# ${block.text.textValue
            .replaceAll('*', '\\*')
            .replaceAll('_', '\\_')}\n`
        )
      }
      if (block.type === BlockType.Source) {
        const source = (block as unknown) as Source
        const citationStyle = getCitationStyle(
          citationStyleId ?? DefaultCitationStyleId
        )
        if (!citationStyle) {
          continue
        }
        const sourceMd = await sourceToMarkdown({
          source,
          citationStyle,
        })
        zip.file(
          `s/${cleanFilename(
            source.name?.textValue ?? source.text.textValue
          )}.md`,
          sourceMd
        )
      }
    }
  }
}

exports.command = 'users'
exports.desc =
  'Export Databyss + markdown zips for users into out/exports/<userId>'
exports.builder = (yargs) =>
  yargs
    .option('user', {
      describe: 'Only export this user email',
      type: 'string',
    })
    .option('delay', {
      describe: 'Sleep duration in ms between user exports',
      type: 'number',
      default: 500,
    })
    .option('databyss', {
      describe: 'Generate databyss.zip',
      type: 'boolean',
      default: false,
    })
    .option('markdown', {
      describe: 'Generate markdown.zip',
      type: 'boolean',
      default: false,
    })
    .option('upload', {
      describe:
        'Upload user export files from out/exports/<userId>/ to public S3 under exports/<userId>-<hash>/',
      type: 'boolean',
      default: false,
    })
    .option('email', {
      describe:
        'Send Postmark template databyss_desktop_migration with deterministic databyss and markdown URLs',
      type: 'boolean',
      default: false,
    })
    .option('full', {
      describe:
        'Run all steps: generate databyss.zip + markdown.zip, upload files, and send email',
      type: 'boolean',
      default: false,
    })

exports.handler = (argv: ServerProcessArgs) => {
  new UserExports(argv).runCli()
}
