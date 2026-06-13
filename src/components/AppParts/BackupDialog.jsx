import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";

const BackupDialog = ({ open, backupText, onBackupTextChange, onClose, onImport }) => (
  <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
    <DialogTitle>Backup & restore</DialogTitle>
    <DialogContent>
      <Typography variant="body2" className="muted" sx={{ mb: 1.5 }}>
        Export your groups as JSON, or paste a backup below to restore.
      </Typography>
      <TextField
        value={backupText}
        onChange={(e) => onBackupTextChange(e.target.value)}
        minRows={10}
        multiline
        fullWidth
        placeholder='{"version":1,"groups":[...]}'
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
      <Button variant="contained" onClick={onImport} disabled={!backupText.trim()}>
        Import backup
      </Button>
    </DialogActions>
  </Dialog>
);

export default BackupDialog;
