import React, { useState } from "react";
import Papa from "papaparse";
import CsvTable from "./components/CsvTable";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Button,
  Box,
  styled
} from "@mui/material";
import { Upload, Assessment } from "@mui/icons-material";

// Updated theme - adjust these colors based on your logo
const theme = createTheme({
  palette: {
    primary: {
      main: '#120147', // Adjust this to match your logo's primary color
      light: '#5A7BC8',
      dark: '#1E3F8A',
    },
    secondary: {
      main: '#FF6B35', // Adjust this to match your logo's secondary color
      light: '#FF8A65',
      dark: '#E64A19',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #120147 0%, #1E3F8A 100%)', // Gradient based on primary colors
        },
      },
    },
  },
});

const Input = styled('input')({
  display: 'none',
});

const LogoImage = styled('img')({
  height: '80px',
  width: 'auto',
  marginRight: '16px',
  objectFit: 'contain',
});

function App() {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: (result) => {
        setData(result.data);
      },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={3}>
        <Toolbar sx={{ py: 1 }}>
          <LogoImage 
            src="/logo.jpg" 
            alt="Logo" 
            onError={(e) => {
              // Fallback if logo doesn't load
              e.target.style.display = 'none';
            }}
          />
          <Assessment sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 500,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Validador de CSV - Cálculo de MDR
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="h4" gutterBottom color="primary">
            Upload do Arquivo CSV
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Selecione um arquivo CSV para validar os cálculos de MDR
          </Typography>
          
          <Box>
            <label htmlFor="csv-upload">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                component="span"
                startIcon={<Upload />}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(46, 91, 186, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(46, 91, 186, 0.4)',
                  },
                }}
              >
                Escolher Arquivo CSV
              </Button>
            </label>
          </Box>
        </Paper>

        {data.length > 0 && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
              Resultados da Validação
            </Typography>
            <CsvTable rows={data} />
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
