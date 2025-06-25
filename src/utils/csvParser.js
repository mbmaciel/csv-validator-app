export const parseCieloCsv = (csvText) => {
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

export const parseStoneCsv = (csvText) => {
  // Sua lógica existente para Stone
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  const rows = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',');
      const row = {};
      
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      return row;
    });
  
  return rows.filter(row => Object.values(row).some(value => value !== ''));
};

export const parseCsv = (csvText, operadora) => {
  switch (operadora) {
    case 'cielo':
      return parseCieloCsv(csvText);
    case 'stone':
      return parseStoneCsv(csvText);
    default:
      throw new Error('Operadora não suportada');
  }
};