if (localStorage.getItem('token')) {
  import('./index.authenticated')
} else {
  window.location = '/login'
}
