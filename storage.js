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
    const usernames = lists[listName] || [];
    return ['username', ...usernames].join('\n');
  },
  async importCSVToList(listName, csvText) {
    const usernames = csvText
      .split(/\r?\n/)
      .flatMap(line => line.split(','))
      .map(u => u.trim())
      .filter(u => u && u.toLowerCase() !== 'username');
    return this.addToList(listName, usernames);
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
    statuses[username] = status;
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
