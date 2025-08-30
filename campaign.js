let usernames = [];
let index = 0;
let messageBox;
let generateBtn;
let statuses = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const params = new URLSearchParams(location.search);
  const listName = params.get('list');
  const lists = await Storage.getLists();
  usernames = lists[listName] || [];
  statuses = await Storage.getLeadsWithStatus();
  document.getElementById('next').addEventListener('click', next);
  document.getElementById('open-profile').addEventListener('click', openProfile);
  document.getElementById('mark-contacted').addEventListener('click', () => setStatus('Contacted'));
  document.getElementById('mark-skipped').addEventListener('click', () => setStatus('Skipped'));
  messageBox = document.getElementById('message');
  generateBtn = document.createElement('button');
  generateBtn.id = 'generate-dm';
  generateBtn.textContent = 'Generate DM';
  document.getElementById('open-profile').insertAdjacentElement('afterend', generateBtn);
  generateBtn.addEventListener('click', generateDM);
  update();
}

function update() {
  if (index >= usernames.length) {
    document.getElementById('username').textContent = 'Campaign complete';
    messageBox.value = '';
    document.getElementById('stats').textContent = `${usernames.length} profiles processed`;
    return;
  }
  const username = usernames[index];
  document.getElementById('username').textContent = '@' + username;
  document.getElementById('stats').textContent = `${index} of ${usernames.length} contacted`;
  const status = statuses[username] || '';
  document.getElementById('status').textContent = status ? `Status: ${status}` : '';
  messageBox.value = '';
}

function openProfile() {
  const username = usernames[index];
  chrome.tabs.create({ url: `https://www.instagram.com/${username}/` });
}

function next() {
  index++;
  update();
}

async function setStatus(status) {
  const username = usernames[index];
  await Storage.updateStatus(username, status);
  statuses[username] = status;
  update();
}

async function generateDM() {
  const apiKey = await Storage.getApiKey();
  if (!apiKey) {
    messageBox.value = 'OpenAI API key not set.';
    return;
  }
  const bio = 'Founder | Marketer | Dog lover | Travel addict';
  const prompt = `Write a short, friendly outreach DM to this person based on their Instagram bio. Bio: ${bio}`;
  try {
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
    const msg = data.choices?.[0]?.message?.content?.trim();
    messageBox.value = msg || 'Could not generate DM.';
  } catch (e) {
    messageBox.value = 'Could not generate DM.';
  }
}
