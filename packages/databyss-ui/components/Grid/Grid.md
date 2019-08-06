```js
import { View } from '@databyss-org/ui/primitives'
const GridCell = props => (
  <View borderVariant="thickDark" width={200} height={200} {...props} />
)
;<Grid>
  {Array(10)
    .fill()
    .map((_, idx) => <GridCell key={idx} />)}
</Grid>
```
