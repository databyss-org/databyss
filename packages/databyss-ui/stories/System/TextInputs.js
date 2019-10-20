import React, { useState } from 'react'
import {
  TextInput,
  RichTextInput,
  TextControl,
  Grid,
} from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section, CaptionedView } from './'

const alea = new Alea('views')
const ipsum = loremIpsum({ units: 'sentences', count: 1, random: alea })

const TextInputs = ({ rich }) => {
  const [value1, setValue1] = useState({ textValue: ipsum })
  const [value2, setValue2] = useState({ textValue: ipsum })
  const [value3, setValue3] = useState({ textValue: ipsum })
  const [value4, setValue4] = useState({ textValue: ipsum })
  const [value5, setValue5] = useState({ textValue: ipsum })
  const [value6, setValue6] = useState({ textValue: ipsum })
  const TextInputComponent = rich ? RichTextInput : TextInput
  const title = rich ? 'Rich Text Inputs' : 'Text Inputs'
  const inputName = rich ? 'RichTextInput' : 'TextInput'
  return (
    <React.Fragment>
      <Section title={title}>
        <Grid>
          <CaptionedView
            caption={inputName}
            paddingVariant="small"
            borderVariant="thinLight"
            height="auto"
          >
            <TextInputComponent
              variant="uiTextNormal"
              value={value1}
              onChange={setValue1}
            />
          </CaptionedView>
          <CaptionedView
            caption="TextControl"
            paddingVariant="small"
            borderVariant="thinLight"
            height="auto"
          >
            <TextControl
              textVariant="uiTextNormal"
              value={value2}
              onChange={setValue2}
              rich={rich}
            />
          </CaptionedView>
        </Grid>
      </Section>
      <Section title={`${title} (multiline)`}>
        <Grid>
          <CaptionedView
            caption={inputName}
            paddingVariant="small"
            borderVariant="thinLight"
            height="auto"
          >
            <TextInputComponent
              variant="uiTextNormal"
              multiline
              value={value3}
              onChange={setValue3}
            />
          </CaptionedView>
          <CaptionedView
            caption="TextControl"
            paddingVariant="small"
            borderVariant="thinLight"
            height="auto"
          >
            <TextControl
              textVariant="uiTextNormal"
              value={value4}
              onChange={setValue4}
              multiline
              rich={rich}
            />
          </CaptionedView>
        </Grid>
      </Section>
      <Section title={`${title} (modal)`}>
        <Grid>
          <CaptionedView
            caption="TextControl (single line)"
            paddingVariant="small"
            borderVariant="thinLight"
            height="auto"
          >
            <TextControl
              textVariant="uiTextNormal"
              value={value5}
              onChange={setValue5}
              modal
              rich={rich}
            />
          </CaptionedView>
          <CaptionedView
            caption="TextControl (multiline)"
            paddingVariant="small"
            borderVariant="thinLight"
            height="auto"
          >
            <TextControl
              textVariant="uiTextNormal"
              value={value6}
              onChange={setValue6}
              modal
              multiline
              rich={rich}
            />
          </CaptionedView>
        </Grid>
      </Section>
    </React.Fragment>
  )
}

export default TextInputs
