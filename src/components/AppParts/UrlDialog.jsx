import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const UrlDialog = ({ open, editingTabId, urlForm, onUrlFormChange, onClose, onSave }) => (
  <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
    <DialogTitle>{editingTabId ? "Edit bookmark" : "Add bookmark"}</DialogTitle>
    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
      <TextField
        autoFocus
        size="small"
        label="Title"
        value={urlForm.title}
        onChange={(e) => onUrlFormChange({ ...urlForm, title: e.target.value })}
        placeholder="Optional"
        fullWidth
      />
      <TextField
        size="small"
        label="URL"
        value={urlForm.url}
        onChange={(e) => onUrlFormChange({ ...urlForm, url: e.target.value })}
        placeholder="https://example.com"
        fullWidth
        onKeyDown={(e) => {
          if (e.key === "Enter" && urlForm.url.trim()) onSave();
        }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSave} disabled={!urlForm.url.trim()}>
        {editingTabId ? "Save" : "Add"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default UrlDialog;
