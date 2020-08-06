/* eslint-disable prefer-promise-reject-errors */

const URL = `${process.env.PDF_API_URL}/pdf/parse`

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
