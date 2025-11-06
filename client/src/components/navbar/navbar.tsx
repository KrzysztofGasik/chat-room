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
import LogoutIcon from '@mui/icons-material/Logout';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useSnackbarContext } from '../../context/snackbar-context';

export const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logOut } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logOut();
    showSnackbar('Successfully logged out', 'success');
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
              <Typography sx={{ color: '#010101' }}>
                {user?.username}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>
              <AlternateEmailIcon sx={{ marginRight: 1 }} />
              <Typography sx={{ color: '#010101' }}>{user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>
              <Button
                onClick={() => navigate('/profile')}
                startIcon={<AccountBoxIcon />}
                sx={{ color: '#010101' }}
              >
                Profile
              </Button>
            </MenuItem>
            <MenuItem onClick={handleCloseUserMenu}>
              <Button
                onClick={() => navigate('/')}
                startIcon={<DoorFrontIcon />}
                sx={{ color: '#010101' }}
              >
                Rooms
              </Button>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseUserMenu}>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ color: '#010101' }}
              >
                Log out
              </Button>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
