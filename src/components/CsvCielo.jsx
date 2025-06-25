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

const parseFloatPt = (str) => {
  // Remove "R$", espaços, pontos de milhares e converte vírgula para ponto
  return parseFloat(str.replace(/R\$\s?/g, "").replace(/\./g, "").replace(",", "."));
};

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

const CsvCielo = ({ rows, customRates }) => {
  // Headers específicos da Cielo
  const headers = [
    "Data da venda",
    "Forma de pagamento", 
    "Quantidade de vendas",
    "Valor bruto",
    "Taxa/tarifa",
    "Valor líquido"
  ];

  const getExpectedRange = (formaPagamento) => {
    if (customRates) {
      // Mapear forma de pagamento para número de parcelas para usar customRates
      const parcelas = formaPagamento.includes("à vista") ? 1 : 
                     formaPagamento.includes("parcelado") ? 2 : 1;
      
      if (customRates[parcelas]) {
        const { min, max } = customRates[parcelas];
        return [min / 100, max / 100];
      }
    }

    // Taxas específicas da Cielo baseadas na forma de pagamento
    if (formaPagamento.includes("à vista")) {
      return [0.0350, 0.0450]; // 3.5% a 4.5% para crédito à vista
    }
    if (formaPagamento.includes("parcelado")) {
      return [0.0650, 0.0750]; // 6.5% a 7.5% para crédito parcelado
    }
    
    return [0, 0.15]; // Faixa padrão ampla
  };

  // Calcular as diferenças e o total
  let totalDiferenca = 0;
  const rowsWithDifference = rows.map((row, i) => {
    const bruto = parseFloatPt(row["Valor bruto"]);
    const liquido = parseFloatPt(row["Valor líquido"]);
    const taxaTarifa = Math.abs(parseFloatPt(row["Taxa/tarifa"])); // Remove o sinal negativo
    const formaPagamento = row["Forma de pagamento"];

    // Calcular taxa efetiva
    const taxa = (bruto - liquido) / bruto;
    const [min, max] = getExpectedRange(formaPagamento);
    
    const tolerance = 0.0001;
    const taxaOk = taxa >= (min - tolerance) && taxa <= (max + tolerance);

    // Validar se o cálculo está correto
    const descontoCalculado = bruto - liquido;
    const descontoOk = Math.abs(descontoCalculado - taxaTarifa) < 0.01;

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

    console.log(`Cielo - Linha ${i}: Taxa=${taxa.toFixed(6)}, Min=${min}, Max=${max}, TaxaOk=${taxaOk}, Forma=${formaPagamento}`);

    return {
      ...row,
      bruto,
      liquido,
      taxaTarifa,
      formaPagamento,
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

  const getFormaPagamentoChip = (formaPagamento) => {
    if (formaPagamento.includes("à vista")) {
      return (
        <Chip 
          label="À Vista" 
          color="primary" 
          size="small" 
          sx={{ fontWeight: 500 }}
        />
      );
    }
    if (formaPagamento.includes("parcelado")) {
      return (
        <Chip 
          label="Parcelado" 
          color="secondary" 
          size="small" 
          sx={{ fontWeight: 500 }}
        />
      );
    }
    return (
      <Chip 
        label={formaPagamento} 
        color="default" 
        size="small" 
        sx={{ fontWeight: 500 }}
      />
    );
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
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {rowData["Data da venda"]}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {getFormaPagamentoChip(rowData["Forma de pagamento"])}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                {rowData["Quantidade de vendas"]}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
                {rowData["Valor bruto"]}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', color: 'error.main' }}>
                {rowData["Taxa/tarifa"]}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
                {rowData["Valor líquido"]}
              </TableCell>
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
                  Total das Diferenças (Cielo):
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

export default CsvCielo;