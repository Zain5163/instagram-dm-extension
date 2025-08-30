document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadLists();
  await loadTemplates();
  document.getElementById('create-list').addEventListener('click', createList);
  document.getElementById('collect').addEventListener('click', collectFromPage);
  document.getElementById('export').addEventListener('click', exportCSV);
  document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import').click());
  document.getElementById('import').addEventListener('change', importCSV);
  document.getElementById('start-campaign').addEventListener('click', startCampaign);
}

  async function loadLists() {
    const select = document.getElementById('list-select');
    const lists = await Storage.getLists();
    select.innerHTML = '';
    Object.keys(lists).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
    select.addEventListener('change', renderUsernames);
    if (select.value) renderUsernames();
  }

async function createList() {
  const name = prompt('List name');
  if (name) {
    await Storage.createList(name);
    await loadLists();
    document.getElementById('list-select').value = name;
    renderUsernames();
  }
}

  async function renderUsernames() {
    const listName = document.getElementById('list-select').value;
    const lists = await Storage.getLists();
    const statuses = await Storage.getLeadsWithStatus();
    const ul = document.getElementById('usernames');
    ul.innerHTML = '';
    (lists[listName] || []).forEach(u => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = u + ' ';
      const select = document.createElement('select');
      ['','contacted','skipped'].forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val ? val.charAt(0).toUpperCase() + val.slice(1) : '-';
        select.appendChild(opt);
      });
      select.value = statuses[u] || '';
      select.addEventListener('change', async e => {
        await Storage.updateStatus(u, e.target.value);
        renderCounts();
      });
      li.appendChild(span);
      li.appendChild(select);
      ul.appendChild(li);
    });
    renderCounts();
  }

async function collectFromPage() {
  const listName = document.getElementById('list-select').value;
  if (!listName) return alert('Create or select a list first.');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'collectUsernames' }, res => {
    if (!res || !res.usernames) return;
    chrome.runtime.sendMessage({ type: 'saveUsernames', list: listName, usernames: res.usernames }, () => {
      renderUsernames();
    });
  });
}

async function exportCSV() {
  const listName = document.getElementById('list-select').value;
  if (!listName) return alert('Select a list first.');
  const csv = await Storage.exportListCSV(listName);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  chrome.downloads?.download({ url, filename: `${listName}.csv` });
}

  async function importCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const listName = document.getElementById('list-select').value;
  if (!listName) {
    alert('Select a list first.');
    return;
  }
    await Storage.importCSVToList(listName, text);
    renderUsernames();
    e.target.value = '';
  }

function startCampaign() {
  const listName = document.getElementById('list-select').value;
  const template = document.getElementById('template-select').value;
  if (!listName) return alert('Select a list.');
  const url = chrome.runtime.getURL(`campaign.html?list=${encodeURIComponent(listName)}&template=${encodeURIComponent(template)}`);
  chrome.tabs.create({ url });
  }

  async function renderCounts() {
    const listName = document.getElementById('list-select').value;
    const lists = await Storage.getLists();
    const statuses = await Storage.getLeadsWithStatus();
    const usernames = lists[listName] || [];
    let contacted = 0;
    let skipped = 0;
    usernames.forEach(u => {
      if (statuses[u] === 'contacted') contacted++;
      if (statuses[u] === 'skipped') skipped++;
    });
    const total = usernames.length;
    const div = document.getElementById('counts');
    div.textContent = `Total: ${total} | Contacted: ${contacted} | Skipped: ${skipped}`;
  }

async function loadTemplates() {
  const templates = await Storage.getTemplates();
  const select = document.getElementById('template-select');
  select.innerHTML = '';
  Object.keys(templates).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}
