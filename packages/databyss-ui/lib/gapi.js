export const getGapi = () =>
  new Promise(resolve => {
    // if gapi was already loaded, just return it
    if (window.gapi) {
      resolve(window.gapi)
    }
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      // return gapi that just loaded
      resolve(window.gapi)
    }
    document.body.appendChild(script)
  })
