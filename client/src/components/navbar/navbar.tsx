import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAuthContext } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

export const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logOut } = useAuthContext();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/signin');
  };
  return (
    <AppBar>
      <Toolbar>
        <Box sx={{ marginLeft: 'auto' }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="avatar" src={`${user?.avatar}`} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{}}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleCloseUserMenu}>
              <AccountCircleIcon sx={{ marginRight: 1 }} />
              <Typography>{user?.username}</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>
              <AlternateEmailIcon sx={{ marginRight: 1 }} />
              <Typography>{user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>
              <Button onClick={() => navigate('/profile')}>Profile</Button>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>
              <Button onClick={() => navigate('/')}>Rooms</Button>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseUserMenu}>
              <Button onClick={handleLogout}>Log out</Button>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
