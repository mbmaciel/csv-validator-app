import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { Business } from '@mui/icons-material';

const OperadoraSelector = ({ operadora, setOperadora, disabled = false }) => {
  return (
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
          Selecione a Operadora
        </Typography>
      </Box>
      
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="operadora-select-label">Operadora de Pagamento</InputLabel>
        <Select
          labelId="operadora-select-label"
          id="operadora-select"
          value={operadora}
          label="Operadora de Pagamento"
          onChange={(e) => setOperadora(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        >
          <MenuItem value="">
            <em>Selecione uma operadora</em>
          </MenuItem>
          <MenuItem value="stone">Stone</MenuItem>
          <MenuItem value="cielo">Cielo</MenuItem>
        </Select>
      </FormControl>
      
      {operadora && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 1 }}
        >
          Operadora selecionada: <strong>{operadora === 'stone' ? 'Stone' : 'Cielo'}</strong>
        </Typography>
      )}
    </Paper>
  );
};

export default OperadoraSelector;