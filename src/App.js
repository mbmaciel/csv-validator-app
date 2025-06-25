import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { OperadoraProvider } from "./context/OperadoraContext";
import Home from "./pages/Home";
import Documentos from "./pages/Documentos";

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OperadoraProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/documentos" element={<Documentos />} />
          </Routes>
        </Router>
      </OperadoraProvider>
    </ThemeProvider>
  );
}

export default App;
