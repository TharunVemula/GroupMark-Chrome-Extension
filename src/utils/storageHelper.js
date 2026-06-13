/**
 * Storage and backup utilities
 */

const STORAGE_KEY = "groupmark_groups";

export const saveGroupsToStorage = (groups) => {
  try {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      groups,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
    return true;
  } catch (err) {
    console.error("Failed to save to storage:", err);
    return false;
  }
};

export const loadGroupsFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.groups || [];
  } catch (err) {
    console.error("Failed to load from storage:", err);
    return [];
  }
};

export const exportGroupsAsJson = (groups) => {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    groups,
  };
  return JSON.stringify(backup, null, 2);
};

export const importGroupsFromJson = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.groups || !Array.isArray(parsed.groups)) {
      throw new Error("Invalid backup format");
    }
    return parsed.groups;
  } catch (err) {
    console.error("Failed to import backup:", err);
    return null;
  }
};
