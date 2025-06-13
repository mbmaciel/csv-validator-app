import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box
} from "@mui/material";
import { CheckCircle, Warning, Error } from "@mui/icons-material";

const parseFloatPt = (str) =>
  parseFloat(str.replace(/\./g, "").replace(",", "."));

const formatCurrency = (value) =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatPercent = (value) => {
  const percentValue = value * 100;
  const formattedValue = percentValue.toFixed(5);
  return `${formattedValue.replace(".", ",")}%`;
};

const CsvTable = ({ rows, customRates }) => {
  const headers = Object.keys(rows[0]);

  const getExpectedRange = (parcelas) => {
    const p = parseInt(parcelas);

    if (customRates && customRates[p]) {
      const { min, max } = customRates[p];
      return [min / 100, max / 100];
    }

    if (p === 1) return [0.0123, 0.0131];
    if (p === 2) return [0.0300, 0.0305];
    if (p === 4) return [0.0300, 0.0305];
    if (p === 10) return [0.0323, 0.0328];
    return [0, 0.3];
  };

  // Calcular as diferenças e o total
  let totalDiferenca = 0;
  const rowsWithDifference = rows.map((row, i) => {
    const bruto = parseFloatPt(row["VALOR BRUTO"]);
    const liquido = parseFloatPt(row["VALOR LIQUIDO"]);
    const desconto = parseFloatPt(row["DESCONTO DE MDR"]);
    const parcelas = row["N DE PARCELAS"];

    const taxa = (bruto - liquido) / bruto;
    const [min, max] = getExpectedRange(parcelas);
    
    const tolerance = 0.0001;
    const taxaOk = taxa >= (min - tolerance) && taxa <= (max + tolerance);

    const descontoCalculado = bruto - liquido;
    const descontoOk = Math.abs(descontoCalculado - Math.abs(desconto)) < 0.01;

    // Calcular diferença quando fora da faixa
    let diferenca = 0;
    if (!taxaOk) {
      if (taxa < min) {
        diferenca = (min - taxa) * bruto;
      } else if (taxa > max) {
        diferenca = (taxa - max) * bruto;
      }
      totalDiferenca += diferenca;
    }

    console.log(`Linha ${i}: Taxa=${taxa.toFixed(6)}, Min=${min}, Max=${max}, TaxaOk=${taxaOk}`);

    return {
      ...row,
      bruto,
      liquido,
      desconto,
      parcelas,
      taxa,
      min,
      max,
      taxaOk,
      descontoOk,
      diferenca
    };
  });

  const getRowColor = (taxaOk, descontoOk) => {
    if (descontoOk && taxaOk) return "#f0f9f0"; // Light green
    if (descontoOk && !taxaOk) return "#fff8e1"; // Light amber
    return "#ffebee"; // Light red
  };

  return (
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{
        maxHeight: '70vh',
        overflow: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#94a3b8',
          },
        },
      }}
    >
      <Table sx={{ minWidth: 1200 }} size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {headers.map((header, idx) => (
              <TableCell 
                key={idx} 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  color: '#1a202c',
                  minWidth: header.length > 15 ? '180px' : '120px',
                  whiteSpace: 'nowrap'
                }}
              >
                {header}
              </TableCell>
            ))}
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              color: '#1a202c',
              minWidth: '120px',
              whiteSpace: 'nowrap'
            }}>
              Taxa Efetiva
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              color: '#1a202c',
              minWidth: '200px',
              whiteSpace: 'nowrap'
            }}>
              Validação Taxa
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              color: '#1a202c',
              minWidth: '150px',
              whiteSpace: 'nowrap'
            }}>
              Validação Cálculo
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              color: '#1a202c',
              minWidth: '130px',
              whiteSpace: 'nowrap'
            }}>
              Diferença (R$)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsWithDifference.map((rowData, i) => (
            <TableRow
              key={i}
              sx={{
                backgroundColor: getRowColor(rowData.taxaOk, rowData.descontoOk),
                '&:hover': {
                  backgroundColor: 'rgba(46, 91, 186, 0.04)',
                },
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {headers.map((header, idx) => (
                <TableCell 
                  key={idx}
                  sx={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px'
                  }}
                  title={rowData[header]} // Tooltip para ver o valor completo
                >
                  {rowData[header]}
                </TableCell>
              ))}
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <Typography variant="body2" fontWeight="medium">
                  {formatPercent(rowData.taxa)}
                </Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {rowData.taxaOk ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Dentro da faixa"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                ) : (
                  <Chip
                    icon={<Warning />}
                    label={`Fora da faixa (${formatPercent(rowData.min)}-${formatPercent(rowData.max)})`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {rowData.descontoOk ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="OK"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                ) : (
                  <Chip
                    icon={<Error />}
                    label="Cálculo Incorreto"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  color={rowData.taxaOk ? "text.secondary" : "error.main"}
                >
                  {rowData.taxaOk ? "-" : formatCurrency(rowData.diferenca)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
            <TableCell 
              colSpan={headers.length + 3} 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                whiteSpace: 'nowrap',
                backgroundColor: '#e8f4fd',
                borderTop: '2px solid #2E5BBA',
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography variant="h6" color="primary">
                  Total das Diferenças:
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ 
              backgroundColor: '#e8f4fd', 
              whiteSpace: 'nowrap',
              borderTop: '2px solid #2E5BBA',
            }}>
              <Typography variant="h6" color="error.main" fontWeight="bold">
                {formatCurrency(totalDiferenca)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CsvTable;
