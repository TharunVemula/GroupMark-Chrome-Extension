import { createTheme } from "@mui/material/styles";

export const GROUP_COLORS = [
  "#4F46E5",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DB2777",
  "#7C3AED",
];

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4F46E5", dark: "#4338CA", light: "#818CF8" },
    secondary: { main: "#7C3AED" },
    success: { main: "#059669" },
    error: { main: "#DC2626" },
    background: { default: "#F4F5F9", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em" },
    button: { fontWeight: 700, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          backgroundColor: "#EEF2FF",
          color: "#4338CA",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 10,
        },
      },
    },
  },
});
