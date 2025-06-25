import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  styled,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  Menu as MenuIcon,
  Assessment,
  InsertDriveFile,
  Close,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoImage = styled('img')({
  height: '80px',
  width: 'auto',
  marginRight: '16px',
  objectFit: 'contain',
});

const AppBarComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      text: 'Validador',
      path: '/',
      icon: <Assessment />
    },
    {
      text: 'Documentos',
      path: '/documentos',
      icon: <InsertDriveFile />
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar position="static" elevation={3}>
        <Toolbar sx={{ py: 1 }}>
          <LogoImage 
            src="/logo.jpg" 
            alt="Logo" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <Search sx={{ mr: 2, fontSize: '2rem', color: 'white' }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 500,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Aplicativo Delator - Cálculo de MDR
          </Typography>
          
          {/* Menu Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{ textTransform: 'none' }}
              >
                Sair
              </Button>
            </Box>
          )}

          {/* Menu Mobile - Botão Hambúrguer */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer Mobile */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(135deg, #120147 0%, #1E3F8A 100%)',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setMobileMenuOpen(false)}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
        
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  py: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRight: '4px solid white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    fontSize: '1.1rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            sx={{ mb: 2 }}
          >
            Sair
          </Button>
          <Typography variant="body2" sx={{ opacity: 0.7, textAlign: 'center' }}>
            Aplicativo Delator
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.5, textAlign: 'center', display: 'block' }}>
            Cálculo de MDR
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default AppBarComponent;