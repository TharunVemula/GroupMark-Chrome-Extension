import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddLinkIcon from "@mui/icons-material/AddLink";
import UrlDialog from "./UrlDialog";
import { filterTabs } from "../../utils";

const emptyUrlForm = { title: "", url: "" };

const DetailPane = ({
  selectedGroup,
  onRenameGroup,
  onDuplicateGroup,
  onDeleteGroup,
  onChangeColor,
  onAddCurrentTab,
  onOpenAllInGroup,
  onAddUrl,
  onUpdateTab,
  onRemoveTab,
  onOpenUrl,
  showNotice,
  GROUP_COLORS,
  tooltipProps,
}) => {
  const [tabQuery, setTabQuery] = useState("");
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [urlForm, setUrlForm] = useState(emptyUrlForm);
  const [editingTabId, setEditingTabId] = useState(null);

  useEffect(() => {
    setTabQuery("");
    setEditingGroup(false);
    setGroupNameDraft("");
    setUrlDialogOpen(false);
    setEditingTabId(null);
    setUrlForm(emptyUrlForm);
  }, [selectedGroup?.id]);

  const visibleTabs = useMemo(
    () => (selectedGroup ? filterTabs(selectedGroup.tabs, tabQuery) : []),
    [selectedGroup, tabQuery]
  );

  const openAddUrlDialog = () => {
    setEditingTabId(null);
    setUrlForm(emptyUrlForm);
    setUrlDialogOpen(true);
  };

  const openEditUrlDialog = (tab) => {
    setEditingTabId(tab.id);
    setUrlForm({ title: tab.title, url: tab.url });
    setUrlDialogOpen(true);
  };

  const closeUrlDialog = () => {
    setUrlDialogOpen(false);
    setEditingTabId(null);
    setUrlForm(emptyUrlForm);
  };

  const handleSaveUrlDialog = () => {
    if (!selectedGroup || !urlForm.url.trim()) return;

    if (editingTabId) {
      onUpdateTab(selectedGroup.id, editingTabId, urlForm.title, urlForm.url);
      showNotice("Bookmark updated.");
    } else {
      onAddUrl(selectedGroup.id, urlForm.title, urlForm.url);
      showNotice("Bookmark added.");
    }

    closeUrlDialog();
  };

  const handleStartRenameGroup = () => {
    if (!selectedGroup) return;
    setEditingGroup(true);
    setGroupNameDraft(selectedGroup.name);
  };

  const handleSaveRenameGroup = () => {
    if (!selectedGroup || !groupNameDraft.trim()) return;
    onRenameGroup(selectedGroup.id, groupNameDraft);
    setEditingGroup(false);
    setGroupNameDraft("");
  };

  const handleCancelRenameGroup = () => {
    setEditingGroup(false);
    setGroupNameDraft("");
  };

  const handleRemoveTab = (tabId) => {
    if (!selectedGroup) return;
    onRemoveTab(selectedGroup.id, tabId);
    if (editingTabId === tabId) closeUrlDialog();
    showNotice("Bookmark removed.");
  };

  if (!selectedGroup) {
    return (
      <Box className="emptyPanel large">
        <Box className="welcomeCard">
          <Typography variant="h2">Welcome to GroupMark</Typography>
          <Typography className="muted">
            Group your bookmarks, open them together, and save entire tab sessions.
          </Typography>
          <Box className="welcomeTips">
            <Typography variant="body2">1. Click Save tabs to capture this window</Typography>
            <Typography variant="body2">2. Or create an empty group and add URLs</Typography>
            <Typography variant="body2">3. Hit Open all to launch every bookmark at once</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="groupHeader">
        <Box className="groupTitleBlock">
          <span className="largeGroupColor" style={{ backgroundColor: selectedGroup.color }} />
          <Box className="groupTitleText">
            {editingGroup ? (
              <TextField
                size="small"
                value={groupNameDraft}
                onChange={(e) => setGroupNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRenameGroup();
                  if (e.key === "Escape") handleCancelRenameGroup();
                }}
                autoFocus
                fullWidth
              />
            ) : (
              <Tooltip title={selectedGroup.name} enterDelay={350} {...tooltipProps}>
                <Typography variant="h2">{selectedGroup.name}</Typography>
              </Tooltip>
            )}
            <Typography className="muted">
              {selectedGroup.tabs.length} bookmark
              {selectedGroup.tabs.length === 1 ? "" : "s"} in this group
            </Typography>
          </Box>
        </Box>
        <Box className="softActions">
          {editingGroup ? (
            <>
              <Button size="small" onClick={handleCancelRenameGroup}>
                Cancel
              </Button>
              <Button size="small" variant="contained" onClick={handleSaveRenameGroup}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="Add bookmark URL" {...tooltipProps}>
                <IconButton size="small" onClick={openAddUrlDialog}>
                  <AddLinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rename group" {...tooltipProps}>
                <IconButton size="small" onClick={handleStartRenameGroup}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate group" {...tooltipProps}>
                <IconButton size="small" onClick={() => onDuplicateGroup(selectedGroup.id)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete group" {...tooltipProps}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteGroup(selectedGroup.id, selectedGroup.name)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <Box className="toolbarRow">
        <Box className="primaryActions">
          <Button variant="contained" size="small" onClick={() => onAddCurrentTab(selectedGroup.id)}>
            + Current tab
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={() => onOpenAllInGroup(selectedGroup)}
            disabled={!selectedGroup.tabs.length}
          >
            Open all
          </Button>
        </Box>
        <Box className="colorSwatches">
          {GROUP_COLORS.map((color) => (
            <button
              key={color}
              aria-label={`Set group color ${color}`}
              className={`swatch ${selectedGroup.color === color ? "selected" : ""}`}
              onClick={() => onChangeColor(selectedGroup.id, color)}
              style={{ backgroundColor: color }}
              type="button"
            />
          ))}
        </Box>
      </Box>

      <TextField
        size="small"
        value={tabQuery}
        onChange={(e) => setTabQuery(e.target.value)}
        placeholder="Filter bookmarks in this group..."
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box className="tabList">
        {visibleTabs.map((tab) => (
          <Box key={tab.id} className="tabItem">
            <button
              className="faviconButton"
              onClick={() => onOpenUrl(tab.url)}
              type="button"
              title="Open bookmark"
            >
              {tab.favIconUrl ? (
                <img alt="" src={tab.favIconUrl} />
              ) : (
                <span>{tab.title.slice(0, 1).toUpperCase()}</span>
              )}
            </button>
            <Box className="tabText">
              <Typography className="tabTitle">{tab.title}</Typography>
              <Typography className="urlText">{tab.url}</Typography>
            </Box>
            <Box className="rowActions">
              <Tooltip title="Open bookmark" {...tooltipProps}>
                <IconButton
                  className="rowIconButton"
                  size="small"
                  onClick={() => onOpenUrl(tab.url)}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit bookmark" {...tooltipProps}>
                <IconButton
                  className="rowIconButton"
                  size="small"
                  onClick={() => openEditUrlDialog(tab)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove bookmark" {...tooltipProps}>
                <IconButton
                  className="rowIconButton danger"
                  size="small"
                  onClick={() => handleRemoveTab(tab.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}

        {!visibleTabs.length && (
          <Box className="emptyPanel">
            <Typography variant="body2">
              {tabQuery
                ? "No bookmarks match your filter."
                : "No bookmarks yet — use the link icon above to add a URL."}
            </Typography>
          </Box>
        )}
      </Box>

      <UrlDialog
        open={urlDialogOpen}
        editingTabId={editingTabId}
        urlForm={urlForm}
        onUrlFormChange={setUrlForm}
        onClose={closeUrlDialog}
        onSave={handleSaveUrlDialog}
      />
    </>
  );
};

export default DetailPane;
