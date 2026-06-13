import { Snackbar, Alert } from "@mui/material";

const NoticeSnackbar = ({ notice, onClose }) => (
  <Snackbar
    autoHideDuration={2800}
    open={Boolean(notice)}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  >
    <Alert severity="success" variant="filled" onClose={onClose}>
      {notice}
    </Alert>
  </Snackbar>
);

export default NoticeSnackbar;
