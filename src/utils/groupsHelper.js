/**
 * Group management utilities - handle all group-related business logic
 */

export const createGroup = (name, color = "#4F46E5") => ({
  id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  color,
  tabs: [],
  createdAt: new Date().toISOString(),
});

export const updateGroup = (group, updates) => ({
  ...group,
  ...updates,
});

export const addTabToGroup = (group, tab) => {
  if (group.tabs.some((t) => t.url === tab.url)) return group;
  return {
    ...group,
    tabs: [...group.tabs, { ...tab, id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }],
  };
};

export const removeTabFromGroup = (group, tabId) => ({
  ...group,
  tabs: group.tabs.filter((t) => t.id !== tabId),
});

export const updateTabInGroup = (group, tabId, updates) => ({
  ...group,
  tabs: group.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
});

export const duplicateGroup = (group) => ({
  ...createGroup(`${group.name} (copy)`, group.color),
  tabs: group.tabs.map((t) => ({ ...t, id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` })),
});

export const renameGroup = (group, newName) => ({
  ...group,
  name: newName,
});

export const changeGroupColor = (group, color) => ({
  ...group,
  color,
});

export const filterGroups = (groups, searchQuery) => {
  if (!searchQuery.trim()) return groups;
  const query = searchQuery.toLowerCase();
  return groups.filter((g) => g.name.toLowerCase().includes(query));
};

export const filterTabs = (tabs, searchQuery) => {
  if (!searchQuery.trim()) return tabs;
  const query = searchQuery.toLowerCase();
  return tabs.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      t.url.toLowerCase().includes(query)
  );
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatUrlForChrome = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};
