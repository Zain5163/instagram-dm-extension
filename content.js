function collectUsernames() {
  const anchors = Array.from(document.querySelectorAll('a[href^="/"]'));
  const usernames = new Set();
  anchors.forEach(a => {
    const parts = a.getAttribute('href').split('/');
    if (parts[1] && parts[2] === '') {
      const name = parts[1];
      if (!name.includes('?') && !name.startsWith('explore') && !name.startsWith('accounts')) {
        usernames.add(name);
      }
    }
  });
  return Array.from(usernames);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'collectUsernames') {
    sendResponse({ usernames: collectUsernames() });
  }
});
