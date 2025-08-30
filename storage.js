const Storage = {
  async get(key) {
    const data = await chrome.storage.local.get(key);
    return data[key];
  },
  async set(key, value) {
    return chrome.storage.local.set({ [key]: value });
  },
  async getLists() {
    return (await this.get('lists')) || {};
  },
  async saveLists(lists) {
    return this.set('lists', lists);
  },
  async exportListCSV(listName) {
    const lists = await this.getLists();
    const statuses = await this.getLeadsWithStatus();
    const usernames = lists[listName] || [];
    const lines = ['username,status'];
    usernames.forEach(u => {
      const status = statuses[u] || '';
      lines.push(`${u},${status}`);
    });
    return lines.join('\n');
  },
  async importCSVToList(listName, csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    const usernames = [];
    const statusUpdates = {};
    lines.forEach((line, idx) => {
      const [usernameRaw, statusRaw] = line.split(',');
      const username = usernameRaw?.trim();
      const status = statusRaw?.trim();
      if (!username || username.toLowerCase() === 'username') return;
      usernames.push(username);
      if (status && status.toLowerCase() !== 'status') {
        statusUpdates[username] = status;
      }
    });
    await this.addToList(listName, usernames);
    if (Object.keys(statusUpdates).length) {
      const statuses = (await this.get('statuses')) || {};
      Object.assign(statuses, statusUpdates);
      await this.set('statuses', statuses);
    }
  },
  async addToList(listName, usernames) {
    const lists = await this.getLists();
    if (!lists[listName]) lists[listName] = [];
    const set = new Set(lists[listName]);
    usernames.forEach(u => set.add(u));
    lists[listName] = Array.from(set);
    return this.saveLists(lists);
  },
  async removeFromList(listName, username) {
    const lists = await this.getLists();
    if (!lists[listName]) return;
    lists[listName] = lists[listName].filter(u => u !== username);
    return this.saveLists(lists);
  },
  async createList(listName) {
    const lists = await this.getLists();
    if (!lists[listName]) lists[listName] = [];
    return this.saveLists(lists);
  },
  async deleteList(listName) {
    const lists = await this.getLists();
    delete lists[listName];
    return this.saveLists(lists);
  },
  async updateStatus(username, status) {
    const statuses = (await this.get('statuses')) || {};
    if (status) {
      statuses[username] = status;
    } else {
      delete statuses[username];
    }
    return this.set('statuses', statuses);
  },
  async getLeadsWithStatus() {
    return (await this.get('statuses')) || {};
  },
  async getTemplates() {
    return (await this.get('templates')) || {};
  },
  async saveTemplates(templates) {
    return this.set('templates', templates);
  },
  async saveApiKey(key) {
    return this.set('openaiKey', key);
  },
  async getApiKey() {
    return this.get('openaiKey');
  }
};

if (typeof window !== 'undefined') {
  window.Storage = Storage;
}
