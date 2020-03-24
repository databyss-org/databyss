import react, { useState } from 'react'
import {
  Text,
  View,
  TextInput,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'
import SearchIcon from '@databyss-org/ui/assets/search.svg'

const Search = ({ onClick }) => {
  const [value, setValue] = useState({
    textValue: '',
    ranges: [],
  })

  return (
    <View height="40px" width="100%" m="small" onClick={onClick}>
      <View
        backgroundColor="background.1"
        height="100%"
        justifyContent="center"
        flex={1}
        borderVariant="thinLight"
        p="small"
      >
        <Grid singleRow alignItems="center">
          <Icon sizeVariant="small" color="text.3">
            <SearchIcon />
          </Icon>
          <TextInput
            placeholder="Search"
            variant="bodyNormal"
            value={value}
            onChange={setValue}
          />
        </Grid>
      </View>
    </View>
  )
}

export default Search
