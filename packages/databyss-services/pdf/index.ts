/* eslint-disable prefer-promise-reject-errors */

// TODO: make env vars?
const host = 'http://localhost'
const port = 5005
const URL = `${host}:${port}/api/pdf/parse`

export const fetchAnnotations = (file: File): Promise<any> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.response))
      } else {
        reject({ message: xhr.response })
      }
    }

    xhr.onerror = () => {
      reject({ message: xhr.response })
    }

    const formData = new FormData()
    formData.append('pdf', file)

    xhr.open('POST', URL)
    xhr.send(formData)
  })
