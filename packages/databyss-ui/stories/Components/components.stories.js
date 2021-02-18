import React from 'react'
import { storiesOf } from '@storybook/react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import {
  ViewportDecorator,
  NavigationDecorator,
  GestureDecorator,
} from '../decorators'
import { NotifyMessage, NotifyError, TriggerError } from './Notifys'
import { NavigationSidebar } from './Sidebar'
import {
  sidebarMenuItems,
  sidebarItemsWithSections,
  collectionsItems,
} from './Sidebar/fixtures'

storiesOf('Components|Notify', module)
  .addDecorator(ViewportDecorator)
  .add('Notify', () => (
    <NotifyProvider envPrefix="STORYBOOK" shouldCheckOnlineStatus={false}>
      <NotifyMessage />
      <NotifyError />
      <TriggerError />
    </NotifyProvider>
  ))
  .add('Error', () => <ErrorFallback message="No Source Found" />)
  .add('Loading', () => <Loading />)

storiesOf('Components|Sidebar', module)
  .addDecorator(ViewportDecorator)
  .addDecorator(NavigationDecorator)
  .addDecorator(GestureDecorator)
  .add('Navigation', () => (
    <NavigationSidebar default items={sidebarMenuItems} />
  ))
  .add('With Sections', () => (
    <NavigationSidebar default items={sidebarItemsWithSections} />
  ))
  .add('Collections', () => (
    <NavigationSidebar default items={collectionsItems} />
  ))
