if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/worldcup2026_v2/sw.js', { scope: '/worldcup2026_v2/', updateViaCache: 'none' }).then(reg => {
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            newSW.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
          }
        })
      })
      // Check for updates every 60s
      setInterval(() => reg.update(), 60000)
    })
  })
}
