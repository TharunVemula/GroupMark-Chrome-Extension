import { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Button, TextField, Tooltip } from "@mui/material";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AddIcon from "@mui/icons-material/Add";
import "./App.css";

import Header from "./components/AppParts/Header";
import Sidebar from "./components/AppParts/Sidebar";
import DetailPane from "./components/AppParts/DetailPane";
import NoticeSnackbar from "./components/AppParts/NoticeSnackbar";

import { GROUP_COLORS } from "./theme";
import {
  createId,
  normalizeGroup,
  normalizeTab,
  loadState,
  saveState,
  getCurrentOpenChromeTabs,
  getActiveChromeTab,
  openTabGroup,
  openUrl,
} from "./utils";

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: { className: "appTooltip" },
    arrow: { className: "appTooltipArrow" },
  },
};

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const state = await loadState();
        if (!mounted) return;
        setGroups(state.groups);
        setSelectedGroupId(state.selectedGroupId ?? state.groups[0]?.id ?? null);
      } catch (error) {
        console.error("Failed to load state:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistGroups = useCallback(
    async (nextGroups, nextSelectedId = selectedGroupId) => {
      const normalizedGroups = nextGroups.map(normalizeGroup);
      const nextId = nextSelectedId ?? normalizedGroups[0]?.id ?? null;
      setGroups(normalizedGroups);
      setSelectedGroupId(nextId);
      await saveState({ groups: normalizedGroups, selectedGroupId: nextId });
    },
    [selectedGroupId]
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null,
    [groups, selectedGroupId]
  );

  const stats = useMemo(
    () => ({
      groupCount: groups.length,
      tabCount: groups.reduce((sum, group) => sum + group.tabs.length, 0),
    }),
    [groups]
  );

  const showNotice = useCallback((message) => setNotice(message), []);
  const clearNotice = useCallback(() => setNotice(""), []);

  const updateGroup = useCallback(
    async (groupId, updater) => {
      const nextGroups = groups.map((group) =>
        group.id === groupId
          ? normalizeGroup({ ...updater(group), updatedAt: Date.now() })
          : group
      );
      await persistGroups(nextGroups, groupId);
    },
    [groups, persistGroups]
  );

  const createGroup = useCallback(
    async (sourceTabs = [], name = "") => {
      const finalName = name.trim() || `My Group ${groups.length + 1}`;
      const group = normalizeGroup({
        id: createId("group"),
        name: finalName,
        color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tabs: sourceTabs,
      });

      await persistGroups([group, ...groups], group.id);
      showNotice(
        sourceTabs.length
          ? `Saved ${sourceTabs.length} open tabs as "${finalName}".`
          : `Created "${finalName}".`
      );
    },
    [groups, persistGroups, showNotice]
  );

  const deleteGroup = useCallback(
    async (groupId, groupName) => {
      const nextGroups = groups.filter((group) => group.id !== groupId);
      await persistGroups(nextGroups, nextGroups[0]?.id ?? null);
      showNotice(`Deleted "${groupName}".`);
    },
    [groups, persistGroups, showNotice]
  );

  const duplicateGroup = useCallback(
    async (groupId) => {
      const sourceGroup = groups.find((group) => group.id === groupId);
      if (!sourceGroup) return;

      const duplicate = normalizeGroup({
        ...sourceGroup,
        id: createId("group"),
        name: `${sourceGroup.name} (copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tabs: sourceGroup.tabs.map((tab) => normalizeTab({ ...tab, id: createId("tab"), addedAt: Date.now() })),
      });

      await persistGroups([duplicate, ...groups], duplicate.id);
      showNotice("Group duplicated.");
    },
    [groups, persistGroups, showNotice]
  );

  const renameGroup = useCallback(
    async (groupId, name) => {
      const finalName = name.trim() || groups.find((group) => group.id === groupId)?.name;
      await updateGroup(groupId, (group) => ({ ...group, name: finalName }));
      showNotice("Group renamed.");
    },
    [groups, updateGroup, showNotice]
  );

  const updateGroupColor = useCallback(
    (groupId, color) => updateGroup(groupId, (group) => ({ ...group, color })),
    [updateGroup]
  );

  const addTabToGroup = useCallback(
    async (groupId, tab) => {
      await updateGroup(groupId, (group) => ({
        ...group,
        tabs: [tab, ...group.tabs.filter((item) => item.url !== tab.url)],
      }));
    },
    [updateGroup]
  );

  const addUrlToGroup = useCallback(
    async (groupId, title, url) => {
      if (!url.trim()) return;
      const tab = normalizeTab({ title, url, addedAt: Date.now() });
      await updateGroup(groupId, (group) => ({ ...group, tabs: [tab, ...group.tabs] }));
    },
    [updateGroup]
  );

  const updateTabInGroup = useCallback(
    async (groupId, tabId, title, url) => {
      if (!url.trim()) return;
      await updateGroup(groupId, (group) => ({
        ...group,
        tabs: group.tabs.map((tab) =>
          tab.id === tabId ? normalizeTab({ ...tab, title, url }) : tab
        ),
      }));
    },
    [updateGroup]
  );

  const removeTabFromGroup = useCallback(
    async (groupId, tabId) => {
      await updateGroup(groupId, (group) => ({
        ...group,
        tabs: group.tabs.filter((tab) => tab.id !== tabId),
      }));
    },
    [updateGroup]
  );

  const handleSaveCurrentWindow = useCallback(async () => {
    setBusy(true);
    try {
      const tabs = await getCurrentOpenChromeTabs();
      if (!tabs.length) {
        showNotice("No savable tabs found in this window.");
        return;
      }
      const name = newGroupName || "Untitled";
      await createGroup(tabs, name);
      setNewGroupName("");
    } finally {
      setBusy(false);
    }
  }, [newGroupName, createGroup, showNotice]);

  const handleCreateEmptyGroup = useCallback(() => createGroup([], ""), [createGroup]);

  const handleSelectGroup = useCallback((groupId) => {
    setSelectedGroupId(groupId);
  }, []);

  const handleAddCurrentTab = useCallback(
    async (groupId) => {
      const tab = await getActiveChromeTab();
      if (!tab) {
        showNotice("Could not read the active tab.");
        return;
      }
      await addTabToGroup(groupId, tab);
      showNotice("Added current tab to group.");
    },
    [addTabToGroup, showNotice]
  );

  const handleOpenUrlInTab = useCallback((url) => {
    openUrl(url);
  }, []);

  const handleOpenAllInGroup = useCallback(
    async (group) => {
      if (!group?.tabs.length) return;
      const grouped = await openTabGroup(group.name, group.tabs, group.color);
      showNotice(
        grouped
          ? `Opened "${group.name}" as a tab group.`
          : `Opened "${group.name}". Chrome tab groups unavailable.`
      );
    },
    [showNotice]
  );

  const handleOpenGroupTabs = handleOpenAllInGroup;

  const handleImportBackup = useCallback(
    async (importedGroups) => {
      await persistGroups(importedGroups, importedGroups[0]?.id ?? null);
    },
    [persistGroups]
  );

  const handleDeleteGroupById = useCallback(
    (group) => {
      deleteGroup(group.id, group.name);
    },
    [deleteGroup]
  );

  if (loading) {
    return <Box className="appShell">Loading…</Box>;
  }

  return (
    <Box className="appShell">
      <Header stats={stats} />

      <Box className="quickPanel">
        <TextField
          size="small"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Name your new group (optional)"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveCurrentWindow();
          }}
        />
        <Tooltip title="Save all tabs in this window">
          <Button
            disabled={busy}
            variant="contained"
            startIcon={<SaveAltIcon />}
            onClick={handleSaveCurrentWindow}
          >
            Save tabs
          </Button>
        </Tooltip>
        <Tooltip title="Create an empty group">
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreateEmptyGroup}>
            New group
          </Button>
        </Tooltip>
      </Box>

      <Box className="workspace">
        <Sidebar
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
          onDeleteGroup={handleDeleteGroupById}
          onOpenGroupTabs={handleOpenGroupTabs}
          onImportBackup={handleImportBackup}
          onNotice={showNotice}
          tooltipProps={tooltipProps}
        />

        <Box className="detailPane">
          <DetailPane
            selectedGroup={selectedGroup}
            onRenameGroup={renameGroup}
            onDuplicateGroup={duplicateGroup}
            onDeleteGroup={deleteGroup}
            onChangeColor={updateGroupColor}
            onAddCurrentTab={handleAddCurrentTab}
            onOpenAllInGroup={handleOpenAllInGroup}
            onAddUrl={addUrlToGroup}
            onUpdateTab={updateTabInGroup}
            onRemoveTab={removeTabFromGroup}
            onOpenUrl={handleOpenUrlInTab}
            showNotice={showNotice}
            GROUP_COLORS={GROUP_COLORS}
            tooltipProps={tooltipProps}
          />
        </Box>
      </Box>

      <NoticeSnackbar notice={notice} onClose={clearNotice} />
    </Box>
  );
};

export default App;
