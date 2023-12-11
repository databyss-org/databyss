import { ReactNode } from 'react'

export { LoadingFallback } from './Notify/LoadingFallback'
export { default as SidebarList } from './Sidebar/SidebarList'
export { default as DropdownListItem } from './Menu/DropdownListItem'
export { DropdownList } from './Menu/DropdownList'
export {
  default as SidebarListItem,
  SidebarListRow,
} from './Sidebar/SidebarListItem'
export {
  NavigationProvider,
  useNavigationContext,
} from './Navigation/NavigationProvider/NavigationProvider'
export { default as AccountMenu } from './PageContent/AccountMenu'
export { StickyHeader } from './Navigation/StickyHeader'
export { TitleInput } from './PageContent/TitleInput'
export {
  IndexResultDetails,
  IndexResultTitle,
  IndexResultsContainer,
} from './IndexPage'
export { CitationView } from './Citation/CitationView'
export { SourceCitationView } from './Citation/SourceCitationView'
export { default as EditSourceForm } from './SourceForm/EditSourceForm'
export { DropdownContainer } from '../'

export interface SidebarListItemLink {
  label: string
  active?: boolean
  onPress: () => void
}

export interface SidebarListItemData<T> {
  text: string
  type: string
  route?: string
  icon?: ReactNode
  data?: T
  iconColor?: string | null
  name?: string
  links?: SidebarListItemLink[]
}
