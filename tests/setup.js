import { vi } from "vitest";

const settingsStore = new Map();

function makeNotifications() {
  return {
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  };
}

function resetSettings() {
  settingsStore.clear();
}

function setSettings(values) {
  Object.entries(values).forEach(([key, value]) => {
    settingsStore.set(key, value);
  });
}

globalThis.__testUtils = {
  resetSettings,
  setSettings,
  settingsStore
};

globalThis.ui = {
  notifications: makeNotifications()
};

globalThis.game = {
  settings: {
    get: vi.fn((moduleId, key) => settingsStore.get(key)),
    set: vi.fn((moduleId, key, value) => {
      settingsStore.set(key, value);
      return Promise.resolve(value);
    }),
    register: vi.fn(),
    registerMenu: vi.fn()
  },
  keybindings: {
    register: vi.fn()
  },
  i18n: {
    localize: vi.fn((key) => key)
  },
  user: {
    id: "user-1",
    isGM: false,
    name: "Test User",
    color: "#ffffff"
  },
  users: []
};

globalThis.CONST = {
  KEYBINDING_PRECEDENCE: {
    NORMAL: 50
  }
};

globalThis.Hooks = {
  once: vi.fn(),
  on: vi.fn()
};

globalThis.Handlebars = {
  registerHelper: vi.fn()
};

globalThis.Dialog = {
  prompt: vi.fn(),
  confirm: vi.fn()
};

globalThis.FormApplication = class {
  static get defaultOptions() {
    return {};
  }

  static get title() {
    return "FormApplication";
  }

  render() {}
  activateListeners() {}
};

globalThis.foundry = {
  utils: {
    mergeObject: (base, other) => ({ ...base, ...other })
  }
};

globalThis.$ = (element) => ({
  data: (key) => element.dataset[key]
});

globalThis.navigator = {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
};
