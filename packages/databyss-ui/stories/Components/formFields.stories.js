import React, { useState } from 'react'
import TextInputField from '@databyss-org/ui/components/Form/TextInputField'
import FormFieldList from '@databyss-org/ui/components/Form/FormFieldList'
import ValueListProvider from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'

const FormStory = () => {
  const [values, setValues] = useState({
    firstName: {
      textValue: '',
    },
    lastName: {
      textValue: '',
    },
    email: {
      textValue: '',
    },
  })

  return (
    <ValueListProvider
      onChange={setValues}
      values={values}
      onSubmit={() => {
        console.log('submit', values)
      }}
    >
      <FormFieldList>
        <TextInputField path="firstName" placeholder="Joe" label="First Name" />
        <TextInputField
          path="lastName"
          placeholder="Schmoe"
          label="Last Name"
        />
        <TextInputField
          path="email"
          placeholder="email@server.com"
          label="Email"
        />
      </FormFieldList>
    </ValueListProvider>
  )
}

storiesOf('Components|Forms', module)
  .addDecorator(ViewportDecorator)
  .add('TextInputField', () => <FormStory />)
