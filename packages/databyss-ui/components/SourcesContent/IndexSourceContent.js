import React from 'react'
import {
  Text,
  View,
  BaseControl,
  Icon,
  Grid,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'

const IndexSourceContent = ({ relations }) => {
  const { navigate } = useNavigationContext()

  const onPageClick = pageId => {
    navigate(`/pages/${pageId}`)
  }

  const onEntryClick = (pageId, entryId) => {
    navigate(`/pages/${pageId}#${entryId}`)
  }

  // TODO: HAVE PAGE ID IN SEARCH RESTULS
  // TODO: CLICK ON PAGE LINK
  const _results = Object.keys(relations.results).map((r, i) => (
    <View key={i} mb="medium">
      <View height="40px">
        <BaseControl
          hoverColor="background.2"
          activeColor="background.3"
          key={`pageHeader-${i}`}
          onClick={() => onPageClick(r)}
        >
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="small" color="text.3">
              <PageSvg />
            </Icon>
            <Text variant="bodyHeading3">
              {relations.results[r][0].pageHeader.name}
            </Text>
          </Grid>
        </BaseControl>
      </View>

      {relations.results[r].map((e, k) => (
        <BaseControl
          hoverColor="background.2"
          activeColor="background.3"
          key={k}
          onClick={() => onEntryClick(r, e.entryId)}
        >
          <View p="small" ml="small">
            <Text>{e.text.textValue}</Text>
          </View>
        </BaseControl>
      ))}
    </View>
  ))
  return <View>{_results}</View>
}
// entries.map((entry, index) => {
//   if (entry.text) {
//     return (
//       <View key={index} mb="em" px="medium" widthVariant="content">
//         <BaseControl
//           onClick={() => {
//             if (onClick) {
//               onClick(entry)
//             }
//           }}
//           py="small"
//           hoverColor="background.2"
//           activeColor="background.3"
//           userSelect="auto"
//           childViewProps={{ flexDirection: 'row' }}
//         >
//           {icon && (
//             <Icon sizeVariant="small" color="text.3" mt="tiny" mr="tiny">
//               {icon}
//             </Icon>
//           )}
//           <Text
//             variant={
//               entry.type === 'sources'
//                 ? 'bodyNormalUnderline'
//                 : 'bodyNormalSemibold'
//             }
//           >
//             {entry.text}
//           </Text>
//         </BaseControl>
//         {entry.citations?.map((citation, i) => (
//           <Text key={i} ml="medium" variant="bodySmall" color="text.2">
//             {citation}
//           </Text>
//         ))}
//       </View>
//     )
//   }
//   return null
// })

export default IndexSourceContent
