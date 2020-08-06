import request from '../lib/request'

const URL = `${process.env.PDF_API_URL}/pdf/parse`

export const fetchAnnotations = (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append('pdf', file)

  return request(
    URL,
    {
      method: 'POST',
      body: formData,
    },
    false
  )
}
