export const store = {
  _state: {
    user: null,
    profile: null,
    module: 'dashboard',
    itemId: null,
    enquiries: [],
    jobs: [],
    cashEntries: [],
    serviceRequests: [],
    inventoryLogs: [],
    profiles: [],
    loading: false,
    sidebarOpen: false
  },

  _listeners: new Set(),

  getState() {
    return this._state;
  },

  setState(partial) {
    Object.assign(this._state, partial);
    this._listeners.forEach(fn => fn(this._state));
  },

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }
};
