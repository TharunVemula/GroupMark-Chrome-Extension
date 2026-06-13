/* global chrome */

const STORAGE_KEY = "groupmark_groups";

const isChromeExtension =
  typeof chrome !== "undefined" &&
  typeof chrome.runtime !== "undefined" &&
  typeof chrome.storage !== "undefined";

const fallbackStorage = {
  async get(key) {
    const raw = window.localStorage.getItem(key);
    return { [key]: raw ? JSON.parse(raw) : undefined };
  },
  async set(payload) {
    Object.entries(payload).forEach(([key, value]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.error("Storage quota exceeded:", err);
      }
    });
  },
};

const chromeStorage = {
  async get(key) {
    return chrome.storage.local.get(key);
  },
  async set(payload) {
    return chrome.storage.local.set(payload);
  },
};

const storage = isChromeExtension ? chromeStorage : fallbackStorage;

/* ------------------------------------------------------------------ */
/*  ID generation                                                     */
/* ------------------------------------------------------------------ */

export const createId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

/* ------------------------------------------------------------------ */
/*  URL helpers                                                       */
/* ------------------------------------------------------------------ */

const normalizeUrl = (url) => {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z\d+\-.]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Format a URL for Chrome: prepend https:// if no protocol is present.
 */
export const formatUrlForChrome = (url) => {
  if (!url?.trim()) return "";
  const trimmed = url.trim();
  if (!/^[a-z][a-z\d+\-.]*:/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

/** Validate a URL string using the URL constructor. */
export const validateUrl = (url) => {
  if (!url?.trim()) return false;
  try {
    new URL(url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------ */
/*  Tab / Group normalization                                         */
/* ------------------------------------------------------------------ */

export const normalizeTab = (tab) => ({
  id: tab.id ?? createId("tab"),
  title: tab.title?.trim() || tab.url || "Untitled tab",
  url: normalizeUrl(tab.url),
  favIconUrl: tab.favIconUrl || "",
  addedAt: tab.addedAt ?? Date.now(),
});

export const normalizeGroup = (group) => ({
  id: group.id ?? createId("group"),
  name: group.name?.trim() || "Untitled group",
  color: group.color || "#4F46E5",
  notes: group.notes || "",
  createdAt: group.createdAt ?? Date.now(),
  updatedAt: group.updatedAt ?? Date.now(),
  tabs: (group.tabs ?? []).map(normalizeTab).filter((tab) => tab.url),
});

/* ------------------------------------------------------------------ */
/*  Filter helpers                                                    */
/* ------------------------------------------------------------------ */

export const filterGroups = (groups, searchQuery) => {
  if (!searchQuery?.trim()) return groups;
  const q = searchQuery.toLowerCase();
  return groups.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.tabs.some((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q))
  );
};

export const filterTabs = (tabs, searchQuery) => {
  if (!searchQuery?.trim()) return tabs;
  const q = searchQuery.toLowerCase();
  return tabs.filter((t) => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q));
};

/* ------------------------------------------------------------------ */
/*  Chrome tab helpers                                                */
/* ------------------------------------------------------------------ */

export async function getCurrentOpenChromeTabs() {
  if (!isChromeExtension || !chrome.tabs?.query) return [];

  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs
    .filter((tab) => tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://"))
    .map(normalizeTab);
}

export async function getActiveChromeTab() {
  if (!isChromeExtension || !chrome.tabs?.query) return null;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")
    ? normalizeTab(tab)
    : null;
}

export async function openUrl(url, active = true) {
  const normalized = normalizeUrl(url);
  if (!normalized) return;

  if (isChromeExtension && chrome.tabs?.create) {
    await chrome.tabs.create({ url: normalized, active });
    return;
  }

  window.open(normalized, "_blank", "noopener,noreferrer");
}

export async function openUrls(urls) {
  for (const url of urls) {
    await openUrl(url, false);
  }
}

const chromeGroupColor = (color) => {
  const colorMap = {
    "#4F46E5": "blue",
    "#0891B2": "cyan",
    "#059669": "green",
    "#D97706": "orange",
    "#DB2777": "pink",
    "#7C3AED": "purple",
  };
  return colorMap[String(color ?? "").toUpperCase()] ?? "blue";
};

/**
 * Open all tabs from a group. Tries to group them in Chrome if the API is
 * available; otherwise opens them in background tabs.
 */
export async function openTabGroup(name, tabs, color) {
  const urls = tabs.map((tab) => normalizeUrl(tab.url)).filter(Boolean);
  if (!urls.length) return false;

  if (
    !isChromeExtension ||
    !chrome.tabs?.create ||
    !chrome.tabs?.group ||
    !chrome.tabGroups?.update
  ) {
    await openUrls(urls);
    return false;
  }

  const createdTabs = [];
  for (const url of urls) {
    const tab = await chrome.tabs.create({ url, active: false });
    if (typeof tab.id === "number") createdTabs.push(tab);
  }

  if (!createdTabs.length) return false;

  const tabIds = createdTabs.map((tab) => tab.id);
  const windowId = createdTabs[0]?.windowId;
  const groupId = await chrome.tabs.group({
    tabIds,
    ...(typeof windowId === "number" ? { createProperties: { windowId } } : {}),
  });
  await chrome.tabGroups.update(groupId, {
    title: name || "Saved tabs",
    color: chromeGroupColor(color),
  });
  return true;
}

/* ------------------------------------------------------------------ */
/*  Backup / export helpers                                           */
/* ------------------------------------------------------------------ */

/**
 * Serialize groups to a JSON string suitable for export / backup.
 */
export const exportGroupsAsJson = (groups) => {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    groups,
  };
  return JSON.stringify(backup, null, 2);
};

/**
 * Parse a JSON backup string and return the groups array.
 * Returns null if the string is not valid backup JSON.
 */
export const importGroupsFromJson = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== "object") throw new Error("Not an object");
    if (!Array.isArray(parsed.groups)) throw new Error("Missing groups array");
    return parsed.groups;
  } catch (err) {
    console.error("Failed to import backup:", err);
    return null;
  }
};

/* ------------------------------------------------------------------ */
/*  State persistence                                                 */
/* ------------------------------------------------------------------ */

export async function loadState() {
  const data = await storage.get(STORAGE_KEY);
  const state = data[STORAGE_KEY] ?? {};
  // Migration: if there's an old-format backup in localStorage under STORAGE_KEY
  // (e.g. from storageHelper), it will be normalized by normalizeGroup below.
  return {
    version: 1,
    groups: (state.groups ?? []).map(normalizeGroup),
    selectedGroupId: state.selectedGroupId ?? null,
    lastSavedAt: state.lastSavedAt ?? null,
  };
}

export async function saveState(nextState) {
  const state = {
    version: 1,
    groups: (nextState.groups ?? []).map(normalizeGroup),
    selectedGroupId: nextState.selectedGroupId ?? null,
    lastSavedAt: Date.now(),
  };

  await storage.set({ [STORAGE_KEY]: state });
  return state;
}

export async function exportState() {
  const state = await loadState();
  return JSON.stringify(state, null, 2);
}
