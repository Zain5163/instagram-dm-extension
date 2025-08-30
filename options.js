document.addEventListener('DOMContentLoaded', init);

async function init() {
  document.getElementById('save-key').addEventListener('click', saveKey);
  document.getElementById('save-template').addEventListener('click', saveTemplate);
  document.getElementById('delete-template').addEventListener('click', deleteTemplate);
  await loadOptions();
}

async function loadOptions() {
  const key = await Storage.getApiKey();
  document.getElementById('api-key').value = key || '';
  const templates = await Storage.getTemplates();
  const select = document.getElementById('template-select');
  select.innerHTML = '';
  Object.entries(templates).forEach(([name, text]) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    opt.dataset.text = text;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    const opt = select.selectedOptions[0];
    if (opt) {
      document.getElementById('template-name').value = opt.value;
      document.getElementById('template-text').value = opt.dataset.text;
    }
  });
}

async function saveKey() {
  const key = document.getElementById('api-key').value.trim();
  if (!key) {
    alert('Please enter an API key');
    return;
  }
  await Storage.saveApiKey(key);
  alert('API key saved');
}

async function saveTemplate() {
  const name = document.getElementById('template-name').value.trim();
  const text = document.getElementById('template-text').value;
  if (!name) return alert('Provide a template name');
  const templates = await Storage.getTemplates();
  templates[name] = text;
  await Storage.saveTemplates(templates);
  await loadOptions();
}

async function deleteTemplate() {
  const select = document.getElementById('template-select');
  const name = select.value;
  if (!name) return;
  const templates = await Storage.getTemplates();
  delete templates[name];
  await Storage.saveTemplates(templates);
  await loadOptions();
}
