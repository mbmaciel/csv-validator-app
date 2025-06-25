import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Business, Description } from '@mui/icons-material';
import { useOperadora } from '../context/OperadoraContext';
import FileUpload from './FileUpload';
import CsvTable from './CsvTable';
import CsvCielo from './CsvCielo';

const OperadoraCsvValidator = () => {
  const { 
    operadora, 
    changeOperadora, 
    csvData, 
    setCsvData, 
    customRates 
  } = useOperadora();
  
  const [error, setError] = useState('');

  const handleDataLoad = (data) => {
    setCsvData(data);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    if (errorMessage) {
      setCsvData(null);
    }
  };

  const renderTable = () => {
    if (!csvData || !operadora) return null;

    switch (operadora) {
      case 'stone':
        return <CsvTable rows={csvData} customRates={customRates} />;
      case 'cielo':
        return <CsvCielo rows={csvData} customRates={customRates} />;
      default:
        return null;
    }
  };

  const getOperadoraInfo = () => {
    switch (operadora) {
      case 'stone':
        return {
          name: 'Stone',
          color: 'primary',
          format: 'CSV com separador vírgula (,)',
          description: 'Formato: VALOR BRUTO, VALOR LIQUIDO, DESCONTO DE MDR, N DE PARCELAS'
        };
      case 'cielo':
        return {
          name: 'Cielo',
          color: 'secondary',
          format: 'CSV com separador ponto e vírgula (;)',
          description: 'Formato: Data da venda; Forma de pagamento; Valor bruto; Taxa/tarifa; Valor líquido'
        };
      default:
        return null;
    }
  };

  const operadoraInfo = getOperadoraInfo();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Seletor de Operadora */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <Business sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary.main">
            Validador de CSV por Operadora
          </Typography>
        </Box>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="operadora-select-label">Selecione a Operadora</InputLabel>
          <Select
            labelId="operadora-select-label"
            id="operadora-select"
            value={operadora}
            label="Selecione a Operadora"
            onChange={(e) => changeOperadora(e.target.value)}
          >
            <MenuItem value="">
              <em>Escolha uma operadora</em>
            </MenuItem>
            <MenuItem value="stone">Stone</MenuItem>
            <MenuItem value="cielo">Cielo</MenuItem>
          </Select>
        </FormControl>

        {operadoraInfo && (
          <Alert severity="info">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Operadora selecionada: {operadoraInfo.name}
                </Typography>
                <Typography variant="body2">
                  {operadoraInfo.description}
                </Typography>
              </Box>
              <Chip 
                label={operadoraInfo.name} 
                color={operadoraInfo.color} 
                size="small" 
              />
            </Box>
          </Alert>
        )}
      </Paper>

      {/* Upload de Arquivo */}
      {operadora && (
        <FileUpload 
          operadora={operadora}
          onDataLoad={handleDataLoad}
          onError={handleError}
        />
      )}

      {/* Mensagens de Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Informações dos Dados Carregados */}
      {csvData && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2">
              ✅ {csvData.length} registro{csvData.length !== 1 ? 's' : ''} carregado{csvData.length !== 1 ? 's' : ''} da {operadoraInfo?.name}
            </Typography>
            <Description color="action" />
          </Box>
        </Alert>
      )}

      {/* Tabela de Resultados */}
      {csvData && (
        <>
          <Divider sx={{ my: 3 }} />
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              📊 Resultado da Validação - {operadoraInfo?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Análise das taxas e cálculos do arquivo CSV
            </Typography>
          </Paper>
          {renderTable()}
        </>
      )}

      {/* Instruções quando nenhuma operadora está selecionada */}
      {!operadora && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 2
          }}
        >
          <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Selecione uma operadora para começar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escolha entre Stone ou Cielo para fazer upload e validar seu arquivo CSV
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default OperadoraCsvValidator;