import { getAuthToken } from '@databyss-org/services/auth'

if (getAuthToken()) {
  window.location = '/'
} else {
  import('./index.unauthenticated')
}
