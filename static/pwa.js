if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/sw.js')
    .then(reg => console.log('✅ Service Worker registered:', reg))
    .catch(err => console.error('⚠️ Service Worker registration failed:', err));
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show your install button
});

document.getElementById('installBtn').addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        console.log('App installed');
      }
      deferredPrompt = null;
    });
  }
});
