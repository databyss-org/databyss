import retryAsPromised from 'retry-as-promised'
import { NetworkUnavailableError } from '../interfaces'
import { getAccountId, getAuthToken } from './../session/clientStorage'
import { checkResponse } from './request'
import { httpPost } from './requestDrive'

const CHUNK_SIZE = 6000000
const MAX_RETRIES = 10

export class ConcurrentUpload {
  uploadProgressMonitor: EventTarget
  partProgress: { [key: number]: number }
  uploadId?: string
  numberOfChunks?: number
  file: File
  fileId: string
  contentType?: string // TODO replace with MIME
  accountId?: string
  token?: string

  constructor({
    file,
    fileId,
    contentType,
  }: {
    file: File
    fileId: string
    contentType?: string // TODO replace with MIME
  }) {
    this.uploadProgressMonitor = new EventTarget()
    this.partProgress = {}
    this.file = file
    this.fileId = fileId
    this.contentType = contentType
  }

  async initUpload() {
    this.accountId = (await getAccountId()) as string
    this.token = await getAuthToken()!

    // get the upload id
    const postBody: { filename: string; contentType?: string } = {
      filename: this.file.name,
    }
    if (this.contentType) {
      postBody.contentType = this.contentType
    }
    const startRes = await httpPost(
      `/b/${this.accountId}/${this.fileId}`,
      postBody
    )
    this.uploadId = startRes.uploadId
  }

  async upload() {
    this.numberOfChunks = Math.ceil(this.file.size / CHUNK_SIZE)
    let partNumber = 0

    // auth headers
    const headers = {
      Authorization: `Bearer ${this.token}`,
    }

    const uploads: Promise<UploadedPart>[] = []

    try {
      do {
        partNumber += 1
        // console.log("[concurrentUpload] creating part: ", partNumber)
        const chunkStart = (partNumber - 1) * CHUNK_SIZE
        const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, this.file.size)
        const chunk = this.file.slice(chunkStart, chunkEnd)
        // console.log("[chunkingUpload] chunk " + chunkStart + "-" + (chunkEnd - 1))
        const chunkForm = new FormData()
        chunkForm.append('uploadId', this.uploadId!)
        chunkForm.append('file', chunk, this.file.name)

        // upload the chunk and add the promise to the list
        uploads.push(
          this.uploadChunk({
            url: `/b/${this.accountId}/${this.fileId}/${partNumber}`,
            chunkForm,
            progressHandler: this.makeProgressHandler(partNumber),
            headers,
          })
        )
      } while (partNumber * CHUNK_SIZE < this.file.size)

      const responses = await Promise.all(uploads)
      console.log('[concurrentUpload] all parts uploaded: ', responses)
      const endRes = await httpPost(`/b/${this.accountId}/${this.fileId}`, {
        parts: responses,
        uploadId: this.uploadId,
      })
      console.log('[chunkingUpload] done:', endRes)
    } catch (err) {
      const error = err as Error
      this.uploadProgressMonitor.dispatchEvent(
        new ErrorEvent('uploadError', { error, message: error.message })
      )
    }
  }

  makeProgressHandler(partNumber: number) {
    return (event: ProgressEvent) => {
      if (!event.lengthComputable) {
        return
      }
      const percentComplete = event.loaded / event.total
      this.partProgress[partNumber] = percentComplete
      const totalPercentComplete =
        (Object.values(this.partProgress).reduce(
          (sum, percent) => sum + percent
        ) /
          this.numberOfChunks!) *
        100
      const progressEvent = new ProgressEvent('upload', {
        loaded: Math.round(totalPercentComplete),
        total: 100,
        lengthComputable: true,
      })
      this.uploadProgressMonitor.dispatchEvent(progressEvent)
    }
  }

  uploadChunk({
    url,
    chunkForm,
    headers = {},
    progressHandler,
  }: {
    url: string
    chunkForm: FormData
    headers: { [key: string]: string }
    progressHandler: (event: ProgressEvent) => void
  }) {
    return retryAsPromised<UploadedPart>(
      () =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', url, true)
          for (const [key, value] of Object.entries(headers)) {
            xhr.setRequestHeader(key, value)
          }
          xhr.upload.addEventListener('progress', progressHandler)
          xhr.onerror = (err: any) => {
            reject(
              new NetworkUnavailableError(
                `[uploadChunk] Network error: ${err?.message}`
              )
            )
          }
          xhr.onload = () => {
            if (
              checkResponse({
                status: xhr.status,
                statusText: xhr.statusText,
                response: xhr.response,
                reject,
              })
            ) {
              resolve(JSON.parse(xhr.response))
            }
          }
          xhr.send(chunkForm)
        }),
      {
        // maximum amount of tries
        max: MAX_RETRIES,
        // Initial backoff duration in ms. Default: 100
        backoffBase: 1000,
        // Exponent to increase backoff each try. Default: 1.1
        backoffExponent: 1.5,
        // the function used for reporting;
        // must have a (string, object) argument signature, where string is the message
        // that will passed in by retry-as-promised, and the object will be this
        // configuration object + the $current property
        report: (msg, config) => {
          // if (config.$current > 1) {
          console.warn('[uploadChunk] PUT attempt.', msg, config)
          // }
        },
        // if user supplies string, it will be used when composing error/reporting
        // messages; else if retry gets a callback, uses callback name in
        // erroring/reporting; else (default) uses literal string 'unknown'
        name: 'uploadChunk',
      }
    )
  }
}

interface UploadedPart {
  partNumber: number
  etag: string
}
