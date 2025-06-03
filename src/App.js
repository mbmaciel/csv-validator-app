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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

const Input = styled('input')({
  display: 'none',
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
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Assessment sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Validador de CSV - Cálculo de MDR
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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
              >
                Escolher Arquivo CSV
              </Button>
            </label>
          </Box>
        </Paper>

        {data.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
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
