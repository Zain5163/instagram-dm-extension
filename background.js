importScripts('storage.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'saveUsernames') {
    Storage.addToList(request.list, request.usernames).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (request.type === 'generateMessage') {
    generateMessage(request.bio, request.template).then(msg => sendResponse({ message: msg })).catch(e => sendResponse({ error: e.message }));
    return true;
  }
});

async function generateMessage(bio, template) {
  const apiKey = await Storage.getApiKey();
  if (!apiKey) return 'OpenAI API key not set in extension options.';
  const prompt = template || `Write a short friendly Instagram DM to a user. Bio: ${bio}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content?.trim() || '';
}
