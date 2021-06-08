import { ReactNode } from 'react'
import { Text } from '@databyss-org/editor/interfaces'

export { LoadingFallback } from './Notify/LoadingFallback'
export { default as SidebarList } from './Sidebar/SidebarList'
export { default as DropdownListItem } from './Menu/DropdownListItem'
export {
  default as SidebarListItem,
  SidebarListRow,
} from './Sidebar/SidebarListItem'
export {
  default as NavigationProvider,
  useNavigationContext,
} from './Navigation/NavigationProvider/NavigationProvider'
export { default as AccountMenu } from './PageContent/AccountMenu'
export { StickyHeader } from './Navigation/SickyHeader'
export { TitleInput } from './PageContent/TitleInput'
export {
  IndexResultDetails,
  IndexResultTitle,
  IndexResultsContainer,
} from './IndexPage'
export { default as Citation } from './Citation/Citation'
export { default as EditSourceForm } from './SourceForm/EditSourceForm'
export { DropdownContainer } from '../'

export interface SidebarListItemData<T> {
  text: string
  type: string
  route: string
  icon?: ReactNode
  data?: T
  iconColor?: string | null
  name?: string
}
