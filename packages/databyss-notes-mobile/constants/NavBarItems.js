import PagesMetadata from '../modules/Pages/PagesMetadata'
import SourcesMetadata from '../modules/Sources/SourcesMetadata'
import TopicsMetadata from '../modules/Topics/TopicsMetadata'
import ConfigMetadata from '../modules/Config/ConfigMetadata'

const NavBarItems = isPublicAccount => [
  PagesMetadata,
  SourcesMetadata,
  TopicsMetadata,
  ...(isPublicAccount ? [] : [ConfigMetadata]),
]

export default NavBarItems
