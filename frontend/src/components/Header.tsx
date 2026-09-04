import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  DirectionsBike,
  Menu as MenuIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { ChatDropdown } from './Chat/ChatDropdown';
import { NotificationDropdown } from './Notifications/NotificationDropdown';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { toggleChatDropdown, isChatDropdownOpen, totalUnreadCount, closeChatDropdown } = useChat();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleNotification = () => {
    if (isChatDropdownOpen) closeChatDropdown();
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleToggleChat = () => {
    if (isNotificationOpen) setIsNotificationOpen(false);
    toggleChatDropdown();
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#4CAF50' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsBike sx={{ fontSize: 32 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              Chợ Xe Đạp
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ textTransform: 'none' }}
            >
              Trang chủ
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/listings"
              sx={{ textTransform: 'none' }}
            >
              Xe đạp
            </Button>
            <Button
              color="inherit"
              sx={{ textTransform: 'none' }}
              onClick={() => navigate('/sell')}
            >
              Đăng tin
            </Button>

            {user && (
              <>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    color="inherit"
                    onClick={toggleNotification}
                    sx={{ ml: 1 }}
                    aria-label="Thông báo"
                  >
                    <NotificationsIcon />
                  </IconButton>
                  {isNotificationOpen && (
                    <Box sx={{ position: 'absolute', top: 40, right: 0, zIndex: 9999 }}>
                      <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    color="inherit"
                    onClick={handleToggleChat}
                    sx={{ ml: 1 }}
                    aria-label="Tin nhắn"
                  >
                    <Badge badgeContent={totalUnreadCount} color="error">
                      <MessageIcon />
                    </Badge>
                  </IconButton>
                  {isChatDropdownOpen && (
                    <Box sx={{ position: 'absolute', top: 40, right: 0, zIndex: 9999 }}>
                      <ChatDropdown />
                    </Box>
                  )}
                </Box>
              </>
            )}

            {!user && (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ textTransform: 'none', ml: 1 }}
              >
                Đăng nhập
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            {user && (
              <>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    color="inherit"
                    onClick={toggleNotification}
                    sx={{ mr: 1 }}
                    aria-label="Thông báo"
                  >
                    <NotificationsIcon />
                  </IconButton>
                  {isNotificationOpen && (
                    <Box sx={{ position: 'absolute', top: 40, right: 0, zIndex: 9999 }}>
                      <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    color="inherit"
                    onClick={handleToggleChat}
                    sx={{ mr: 1 }}
                    aria-label="Tin nhắn"
                  >
                    <Badge badgeContent={totalUnreadCount} color="error">
                      <MessageIcon />
                    </Badge>
                  </IconButton>
                  {isChatDropdownOpen && (
                    <Box sx={{ position: 'absolute', top: 40, right: 0, zIndex: 9999 }}>
                      <ChatDropdown />
                    </Box>
                  )}
                </Box>
              </>
            )}

            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/'); handleClose(); }}>
                Trang chủ
              </MenuItem>
              <MenuItem onClick={() => { navigate('/listings'); handleClose(); }}>
                Xe đạp
              </MenuItem>
              <MenuItem onClick={() => { navigate('/sell'); handleClose(); }}>
                Đăng tin
              </MenuItem>
              {!user && (
                <MenuItem onClick={() => { navigate('/login'); handleClose(); }}>
                  Đăng nhập
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
