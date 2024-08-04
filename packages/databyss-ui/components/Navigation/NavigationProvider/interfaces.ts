import { AuthorName } from '@databyss-org/services/interfaces'
import { ReactNode } from 'react'

export interface PropsDict {
  [name: string]: any
}

export interface ModalOptions {
  visible: boolean
  props: PropsDict
  component: ReactNode
}
export class NavigationState {
  modals: ModalOptions[]
  menuOpen: boolean
  sidebarPath: string
  constructor() {
    this.modals = []
    this.menuOpen = false
    this.sidebarPath = '/'
  }
}

export interface NavigateOptions {
  hasAccount?: boolean
}

export interface PathTokens {
  type: string
  params: string
  anchor?: string
  author?: AuthorName
}
