import { Box, Typography } from "@mui/material";

export default function Logo({ compact = false }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        component="img"
        src="./logo.svg"
        alt="GroupMark logo"
        sx={{
          width: compact ? 32 : 40,
          height: compact ? 32 : 40,
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
        }}
      />
      {!compact && (
        <Box>
          <Typography
            sx={{
              fontSize: "1.35rem",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            GroupMark
          </Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.25 }}>
            Bookmark groups made easy
          </Typography>
        </Box>
      )}
    </Box>
  );
}
