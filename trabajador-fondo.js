chrome.runtime.onInstalled.addListener((detalles) => {
  if (detalles.reason === 'install') {
    console.log('Samjoko Nav Extension instalada');
  }
});
