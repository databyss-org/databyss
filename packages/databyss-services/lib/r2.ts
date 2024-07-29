// from: https://github.com/f2face/cloudflare-r2
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ReadStream, createReadStream, PathLike } from 'fs'
import type { Readable } from 'stream'

export type CloudflareR2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
}

export type UploadFileResponse = {
  objectKey: string
  etag?: string
  versionId?: string
}

export function getR2Client(config: CloudflareR2Config) {
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`

  return new S3Client({
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: 'auto',
  })
}

/**
 * Upload an object to the bucket.
 * @param contents The object contents to upload.
 * @param destination The name of the file to put in the bucket. If `destination` contains slash character(s), this will put the file inside directories. If the file already exists in the bucket, it will be overwritten.
 * @param customMetadata Custom metadata to set to the uploaded file.
 * @param mimeType Optional mime type. (Default: `application/octet-stream`)
 */
export async function upload({
  client,
  bucketName,
  contents,
  destination,
  customMetadata,
  mimeType,
}: {
  client: S3Client
  bucketName: string
  contents: string | Uint8Array | Buffer | Readable | ReadStream
  destination: string
  customMetadata?: Record<string, string>
  mimeType?: string
}): Promise<UploadFileResponse> {
  const _destination = destination.startsWith('/')
    ? destination.replace(/^\/+/, '')
    : destination

  const result = await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: _destination,
      Body: contents,
      ContentType: mimeType || 'application/octet-stream',
      Metadata: customMetadata,
    })
  )

  console.log('[R2] upload res', result)

  return {
    objectKey: destination,
    etag: result.ETag,
    versionId: result.VersionId,
  }
}