import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, styled } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const LogoImage = styled('img')({
  height: '80px',
  width: 'auto',
  marginRight: '16px',
  objectFit: 'contain',
});

const AppBarComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              fontWeight: location.pathname === '/' ? 600 : 400,
              borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
            }}
          >
            Validador
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/documentos')}
            sx={{
              textTransform: 'none',
              fontWeight: location.pathname === '/documentos' ? 600 : 400,
              borderBottom: location.pathname === '/documentos' ? '2px solid white' : 'none',
            }}
          >
            Documentos
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;