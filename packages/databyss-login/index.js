import { checkToken } from './src/actions'

const token = localStorage.getItem('token')
if (token) {
  checkToken({ token })
} else {
  import('./index.unauthenticated')
}
