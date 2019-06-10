Sizes

```js
<Text textSize='extraLarge'>Extra large text</Text>
<Text textSize='large'>Large text</Text>
<Text>Default textSize</Text>
<Text textSize='small'>Small text</Text>
<Text textSize='extraSmall'>Tiny text</Text>
```

Typefaces

```js
<Text>Default face</Text>
<Text fontFamily='serif'>Serif face</Text>
<Text fontFamily='sans'>Sans-serif face</Text>
<Text fontFamily='mono'>mono face</Text>
```

Paragraphs

```js
const loremIpsum = require('lorem-ipsum')
;<Content>
  <Text textSize="extraLarge">Default line heights</Text>
  <Text>{loremIpsum({ units: 'sentences', count: 12 })}</Text>
  <Text textSize="extraLarge">Large line heights</Text>
  <Text lineHeight="large">
    {loremIpsum({ units: 'sentences', count: 12 })}
  </Text>
</Content>
```
