import React, { useState } from "react";
import Papa from "papaparse";
import CsvTable from "../components/CsvTable";
import AppBarComponent from "../components/AppBarComponent";
import {
  Container,
  Paper,
  Button,
  Box,
  Typography,
  styled,
  Alert,
  CircularProgress
} from "@mui/material";
import { Upload, CloudUpload } from "@mui/icons-material";

const Input = styled('input')({
  display: 'none',
});

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setUploadStatus(null);

    // Parse do CSV para exibição
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: async (result) => {
        setData(result.data);
        
        // Upload do arquivo para o servidor
        try {
          const formData = new FormData();
          formData.append('csvFile', file);

          const response = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            setUploadStatus({
              type: 'success',
              message: `Arquivo "${result.originalName}" salvo com sucesso no servidor!`
            });
          } else {
            const error = await response.json();
            setUploadStatus({
              type: 'error',
              message: `Erro ao salvar arquivo: ${error.error}`
            });
          }
        } catch (error) {
          setUploadStatus({
            type: 'error',
            message: 'Erro de conexão com o servidor'
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <>
      <AppBarComponent />
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
            Selecione um arquivo CSV para validar os cálculos de MDR. O arquivo será salvo no servidor para consulta posterior.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <label htmlFor="csv-upload">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <Button
                variant="contained"
                component="span"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
                size="large"
                disabled={loading}
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
                {loading ? 'Processando...' : 'Escolher Arquivo CSV'}
              </Button>
            </label>
          </Box>

          {uploadStatus && (
            <Alert 
              severity={uploadStatus.type} 
              sx={{ mt: 2 }}
              icon={uploadStatus.type === 'success' ? <CloudUpload /> : undefined}
            >
              {uploadStatus.message}
            </Alert>
          )}

          {selectedFile && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Arquivo selecionado:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </Typography>
            </Box>
          )}
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
    </>
  );
};

export default Home;