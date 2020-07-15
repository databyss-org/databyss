import React from 'react'
import { useParams } from '@reach/router'
import IndexPageContent from '../PageContent/IndexPageContent'

const AuthorCitations = () => {
  const { query } = useParams()
  const params = new URLSearchParams(query)
  const authorFirstName = params.get('firstName')
  const authorLastName = params.get('lastName')

  return (
    <IndexPageContent
      title={`${authorLastName}${authorFirstName &&
        authorLastName &&
        ','} ${authorFirstName}`}
    />
  )
}

export default AuthorCitations
