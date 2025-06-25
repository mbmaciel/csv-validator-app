import React, { useState } from "react";
import Papa from "papaparse";
import CsvTable from "../components/CsvTable";
import CsvCielo from "../components/CsvCielo";
import AppBarComponent from "../components/AppBarComponent";
import {
  Container,
  Paper,
  Button,
  Box,
  Typography,
  styled,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { Upload, CloudUpload, Settings, ExpandMore } from "@mui/icons-material";

const Input = styled('input')({
  display: 'none',
});

// Função para processar CSV da Cielo
const parseCieloCsv = (csvText) => {
  const lines = csvText.split('\n');
  
  // Encontrar onde começam os dados (procurar pela linha com os headers)
  const headerLine = lines.findIndex(line => 
    line.includes('Data da venda') && 
    line.includes('Forma de pagamento') && 
    line.includes('Valor bruto')
  );
  
  if (headerLine === -1) {
    throw new Error('Formato de CSV da Cielo não reconhecido. Verifique se o arquivo contém os headers esperados.');
  }
  
  // Extrair headers
  const headers = lines[headerLine].split(';');
  
  // Processar dados a partir da linha seguinte aos headers
  const dataLines = lines.slice(headerLine + 1).filter(line => line.trim() !== '');
  
  const rows = dataLines.map(line => {
    const values = line.split(';');
    const row = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    return row;
  });
  
  return rows.filter(row => row['Valor bruto'] && row['Valor bruto'] !== '');
};

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [customRates, setCustomRates] = useState({
    1: { min: 1.23, max: 1.31 },
    2: { min: 3.00, max: 3.05 },
    4: { min: 3.00, max: 3.05 },
    10: { min: 3.23, max: 3.28 }
  });

  const handleRateChange = (parcelas, tipo, valor) => {
    const numericValue = parseFloat(valor) || 0;
    setCustomRates(prev => ({
      ...prev,
      [parcelas]: {
        ...prev[parcelas],
        [tipo]: numericValue
      }
    }));
  };

  const handleFileTypeChange = (event) => {
    setFileType(event.target.value);
    // Limpar dados quando trocar de operadora
    setData([]);
    setSelectedFile(null);
    if (uploadStatus) {
      setUploadStatus(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!fileType) {
      setUploadStatus({
        type: 'error',
        message: 'Por favor, selecione o tipo de arquivo antes de enviar.'
      });
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    setUploadStatus(null);

    try {
      const text = await file.text();
      let parsedData;

      // Processar baseado na operadora selecionada
      if (fileType === 'cielo') {
        parsedData = parseCieloCsv(text);
      } else {
        // Para Stone e outras operadoras, usar Papa Parse
        const result = await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            delimiter: ";",
            complete: (result) => resolve(result),
          });
        });
        parsedData = result.data;
      }

      if (parsedData.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo CSV.');
      }

      setData(parsedData);
      
      // Upload do arquivo para o servidor
      try {
        const formData = new FormData();
        formData.append('csvFile', file);
        formData.append('fileType', fileType);

        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadStatus({
            type: 'success',
            message: `Arquivo "${result.originalName}" processado e salvo com sucesso! ${parsedData.length} registros carregados.`
          });
        } else {
          const error = await response.json();
          setUploadStatus({
            type: 'warning',
            message: `Arquivo processado localmente (${parsedData.length} registros), mas erro ao salvar no servidor: ${error.error}`
          });
        }
      } catch (serverError) {
        setUploadStatus({
          type: 'warning',
          message: `Arquivo processado localmente (${parsedData.length} registros), mas erro de conexão com o servidor.`
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setUploadStatus({
        type: 'error',
        message: `Erro ao processar arquivo: ${error.message}`
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getOperadoraInfo = () => {
    switch (fileType) {
      case 'stone':
        return {
          name: 'Stone',
          format: 'CSV com separador ponto e vírgula (;)',
          description: 'Colunas esperadas: VALOR BRUTO, VALOR LIQUIDO, DESCONTO DE MDR, N DE PARCELAS'
        };
      case 'cielo':
        return {
          name: 'Cielo',
          format: 'CSV com separador ponto e vírgula (;)',
          description: 'Colunas esperadas: Data da venda, Forma de pagamento, Valor bruto, Taxa/tarifa, Valor líquido'
        };
      case 'american':
        return {
          name: 'American Express',
          format: 'CSV com separador ponto e vírgula (;)',
          description: 'Formato similar ao Stone'
        };
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (!data.length || !fileType) return null;

    switch (fileType) {
      case 'stone':
      case 'american':
        return <CsvTable rows={data} customRates={customRates} />;
      case 'cielo':
        return <CsvCielo rows={data} customRates={customRates} />;
      default:
        return null;
    }
  };

  const operadoraInfo = getOperadoraInfo();

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
            Selecione a operadora e um arquivo CSV para validar os cálculos de MDR. O arquivo será salvo no servidor para consulta posterior.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <FormControl
              required
              sx={{
                minWidth: 200,
                flex: '1 1 auto',
                maxWidth: { xs: '100%', sm: '300px' }
              }}
            >
              <InputLabel
                id="file-type-label"
                sx={{ fontSize: '1.1rem' }}
              >
                Operadora
              </InputLabel>
              <Select
                labelId="file-type-label"
                id="file-type-select"
                value={fileType}
                label="Operadora"
                onChange={handleFileTypeChange}
                disabled={loading}
                sx={{
                  height: 56,
                  fontSize: '1.1rem',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.5,
                  }
                }}
              >
                <MenuItem value=""><em>Selecione a operadora</em></MenuItem>
                <MenuItem value="stone">Stone</MenuItem>
                <MenuItem value="cielo">Cielo</MenuItem>
                <MenuItem value="american">American Express</MenuItem>
              </Select>
            </FormControl>

            <label htmlFor="csv-upload">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading || !fileType}
              />
              <Button
                variant="contained"
                component="span"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
                size="large"
                disabled={loading || !fileType}
                sx={{
                  px: 4,
                  py: 1.5,
                  height: 56,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(46, 91, 186, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(46, 91, 186, 0.4)',
                  },
                  flex: '1 1 auto',
                  maxWidth: { xs: '100%', sm: '300px' }
                }}
              >
                {loading ? 'Processando...' : 'Escolher Arquivo CSV'}
              </Button>
            </label>
          </Box>

          {/* Informações da operadora selecionada */}
          {operadoraInfo && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Operadora selecionada: {operadoraInfo.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Formato: {operadoraInfo.format}
              </Typography>
              <Typography variant="body2">
                {operadoraInfo.description}
              </Typography>
            </Alert>
          )}

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="custom-rates-content"
              id="custom-rates-header"
            >
              <Settings sx={{ mr: 1 }} />
              <Typography>Configurar Taxas Personalizadas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(customRates).map(([parcelas, rates]) => (
                  <Grid item xs={12} sm={6} md={3} key={parcelas}>
                    <Typography variant="subtitle2" gutterBottom>
                      {parcelas}x
                    </Typography>
                    <TextField
                      label="Taxa Mínima"
                      type="number"
                      value={rates.min}
                      onChange={(e) => handleRateChange(parcelas, 'min', e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mb: 1 }}
                      inputProps={{ step: "0.01" }}
                    />
                    <TextField
                      label="Taxa Máxima"
                      type="number"
                      value={rates.max}
                      onChange={(e) => handleRateChange(parcelas, 'max', e.target.value)}
                      size="small"
                      fullWidth
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

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
                {operadoraInfo && (
                  <span> - <strong>Operadora:</strong> {operadoraInfo.name}</span>
                )}
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
              Resultados da Validação - {operadoraInfo?.name}
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                📊 {data.length} registro{data.length !== 1 ? 's' : ''} processado{data.length !== 1 ? 's' : ''} com sucesso
              </Typography>
            </Alert>
            {renderTable()}
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Home;