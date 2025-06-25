import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import { parseCsv } from '../utils/csvParser';

const FileUpload = ({ operadora, onDataLoad, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onError('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    if (!operadora) {
      onError('Por favor, selecione uma operadora antes de fazer o upload.');
      return;
    }

    setUploading(true);
    setUploadedFile(file);

    try {
      const text = await file.text();
      const parsedData = parseCsv(text, operadora);
      
      if (parsedData.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo CSV.');
      }

      onDataLoad(parsedData);
      onError(''); // Limpar erros anteriores
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      onError(`Erro ao processar arquivo: ${error.message}`);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const getOperadoraInfo = () => {
    switch (operadora) {
      case 'stone':
        return {
          name: 'Stone',
          format: 'CSV com separador vírgula (,)',
          columns: 'VALOR BRUTO, VALOR LIQUIDO, DESCONTO DE MDR, N DE PARCELAS'
        };
      case 'cielo':
        return {
          name: 'Cielo',
          format: 'CSV com separador ponto e vírgula (;)',
          columns: 'Data da venda, Forma de pagamento, Valor bruto, Taxa/tarifa, Valor líquido'
        };
      default:
        return null;
    }
  };

  const operadoraInfo = getOperadoraInfo();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        border: dragActive ? '2px dashed #2E5BBA' : '1px solid #e2e8f0',
        backgroundColor: dragActive ? '#f8fafc' : 'white',
        transition: 'all 0.3s ease'
      }}
    >
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <Description sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="primary.main">
          Upload do Arquivo CSV
        </Typography>
      </Box>

      {operadoraInfo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Formato esperado para {operadoraInfo.name}:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • {operadoraInfo.format}
          </Typography>
          <Typography variant="body2">
            • Colunas: {operadoraInfo.columns}
          </Typography>
        </Alert>
      )}

      <Box
        sx={{
          border: '2px dashed #cbd5e1',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: dragActive ? '#f1f5f9' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            borderColor: '#94a3b8'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={!operadora || uploading}
        />

        <CloudUpload 
          sx={{ 
            fontSize: 48, 
            color: dragActive ? 'primary.main' : 'text.secondary',
            mb: 2 
          }} 
        />

        <Typography variant="h6" sx={{ mb: 1 }}>
          {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo CSV'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ou clique para selecionar
        </Typography>

        <Button
          variant="contained"
          component="span"
          disabled={!operadora || uploading}
          sx={{ mt: 1 }}
        >
          Selecionar Arquivo
        </Button>
      </Box>

      {uploading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Processando arquivo...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {uploadedFile && !uploading && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2">
                  Arquivo carregado com sucesso!
                </Typography>
                <Typography variant="body2">
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </Typography>
              </Box>
              <Chip 
                label={operadoraInfo?.name} 
                color="primary" 
                size="small" 
              />
            </Box>
          </Alert>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;