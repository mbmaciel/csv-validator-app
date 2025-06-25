import React, { createContext, useContext, useState } from 'react';

const OperadoraContext = createContext();

export const useOperadora = () => {
  const context = useContext(OperadoraContext);
  if (!context) {
    throw new Error('useOperadora deve ser usado dentro de um OperadoraProvider');
  }
  return context;
};

export const OperadoraProvider = ({ children }) => {
  const [operadora, setOperadora] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [customRates, setCustomRates] = useState(null);

  const resetData = () => {
    setCsvData(null);
    setCustomRates(null);
  };

  const changeOperadora = (newOperadora) => {
    setOperadora(newOperadora);
    resetData(); // Limpar dados quando trocar de operadora
  };

  const value = {
    operadora,
    setOperadora,
    changeOperadora,
    csvData,
    setCsvData,
    customRates,
    setCustomRates,
    resetData
  };

  return (
    <OperadoraContext.Provider value={value}>
      {children}
    </OperadoraContext.Provider>
  );
};