import React from "react";

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

const CsvTable = ({ rows }) => {
  const headers = Object.keys(rows[0]);

  const getExpectedRange = (parcelas) => {
    const p = parseInt(parcelas);
    if (p === 1) return [0.0123, 0.0131]; // Aumentei a tolerância
    if (p === 2) return [0.0300, 0.0305];
    if (p === 4) return [0.0300, 0.0305];
    if (p === 10) return [0.0323, 0.0328];
    return [0, 0.3]; // fallback genérico
  };

  return (
    <table border="1" cellPadding="10" style={{ marginTop: "2rem", width: "100%" }}>
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th key={idx}>{header}</th>
          ))}
          <th>Taxa Efetiva</th>
          <th>Validação Taxa</th>
          <th>Validação Cálculo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const bruto = parseFloatPt(row["VALOR BRUTO"]);
          const liquido = parseFloatPt(row["VALOR LIQUIDO"]);
          const desconto = parseFloatPt(row["DESCONTO DE MDR"]);
          const parcelas = row["N DE PARCELAS"];

          const taxa = (bruto - liquido) / bruto;
          const [min, max] = getExpectedRange(parcelas);
          
          // Adicionar uma pequena tolerância para problemas de precisão
          const tolerance = 0.0001;
          const taxaOk = taxa >= (min - tolerance) && taxa <= (max + tolerance);

          const descontoCalculado = bruto - liquido;
          const descontoOk = Math.abs(descontoCalculado - Math.abs(desconto)) < 0.01;

          // Debug: adicionar console.log para verificar os valores
          console.log(`Linha ${i}: Taxa=${taxa.toFixed(6)}, Min=${min}, Max=${max}, TaxaOk=${taxaOk}`);

          return (
            <tr
              key={i}
              style={{
                backgroundColor: descontoOk ? (taxaOk ? "#e0ffe0" : "#ffffcc") : "#ffe0e0",
              }}
            >
              {headers.map((header, idx) => (
                <td key={idx}>{row[header]}</td>
              ))}
              <td>{formatPercent(taxa)}</td>
              <td>
                {taxaOk ? "✔️ Dentro da faixa" : `⚠️ Fora da faixa (${formatPercent(min)}-${formatPercent(max)})`}
              </td>
              <td>{descontoOk ? "✅ OK" : "❌ Cálculo Incorreto"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CsvTable;
