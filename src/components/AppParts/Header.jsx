import { Box, Chip } from "@mui/material";
import Logo from "../Logo/Logo";

const Header = ({ stats }) => (
  <Box className="heroBar">
    <Logo />
    <Box className="statCluster">
      <Chip label={`${stats.groupCount} groups`} size="small" />
      <Chip label={`${stats.tabCount} bookmarks`} size="small" />
    </Box>
  </Box>
);

export default Header;
