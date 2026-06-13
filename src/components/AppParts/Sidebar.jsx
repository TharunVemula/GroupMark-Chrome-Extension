import { useState, useMemo } from "react";
import { Box, TextField, InputAdornment, Tooltip, Typography, Divider, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BackupDialog from "./BackupDialog";
import { filterGroups, exportGroupsAsJson, importGroupsFromJson } from "../../utils";

const Sidebar = ({
  groups,
  selectedGroup,
  onSelectGroup,
  onDeleteGroup,
  onOpenGroupTabs,
  onImportBackup,
  onNotice,
  tooltipProps,
}) => {
  const [query, setQuery] = useState("");
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupText, setBackupText] = useState("");

  const filteredGroups = useMemo(() => filterGroups(groups, query), [groups, query]);

  const handleExport = () => {
    setBackupText(exportGroupsAsJson(groups));
    setBackupOpen(true);
  };

  const handleImport = async () => {
    const importedGroups = importGroupsFromJson(backupText);
    if (!importedGroups) {
      onNotice("Invalid backup JSON.");
      return;
    }

    try {
      await onImportBackup(importedGroups);
      setBackupOpen(false);
      setBackupText("");
      onNotice("Backup imported successfully.");
    } catch (error) {
      console.error(error);
      onNotice("Unable to import backup.");
    }
  };

  return (
    <Box className="sidebar">
      <TextField
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search groups..."
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box className="groupList">
        {filteredGroups.map((group) => (
          <Box
            key={group.id}
            className={`groupItem ${group.id === selectedGroup?.id ? "active" : ""}`}
          >
            <Tooltip title={group.name} enterDelay={350} {...tooltipProps}>
              <button
                className="groupButton"
                onClick={() => onSelectGroup(group.id)}
                type="button"
              >
                <span className="groupColor" style={{ backgroundColor: group.color }} />
                <span className="groupMeta">
                  <strong>{group.name}</strong>
                </span>
              </button>
            </Tooltip>
            <Box className="groupCardActions">
              <Tooltip title="Open all as Chrome tab group" {...tooltipProps}>
                <span>
                  <button
                    className="groupIconButton"
                    type="button"
                    disabled={!group.tabs.length}
                    aria-label={`Open all in ${group.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenGroupTabs(group);
                    }}
                  >
                    <OpenInNewIcon sx={{ fontSize: 15 }} />
                  </button>
                </span>
              </Tooltip>
              <Tooltip title="Delete group" {...tooltipProps}>
                <button
                  className="groupIconButton danger"
                  type="button"
                  aria-label={`Delete ${group.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group);
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                </button>
              </Tooltip>
            </Box>
          </Box>
        ))}

        {!filteredGroups.length && (
          <Box className="sidebarEmpty">
            <Typography variant="body2">No groups yet</Typography>
            <Typography variant="caption">Save tabs or create a group above</Typography>
          </Box>
        )}
      </Box>

      <Divider />
      <Box className="backupActions">
        <Button size="small" onClick={handleExport}>
          Export
        </Button>
        <Button size="small" onClick={() => setBackupOpen(true)}>
          Import
        </Button>
      </Box>

      <BackupDialog
        open={backupOpen}
        backupText={backupText}
        onBackupTextChange={setBackupText}
        onClose={() => {
          setBackupOpen(false);
          setBackupText("");
        }}
        onImport={handleImport}
      />
    </Box>
  );
};

export default Sidebar;
