import React, { useState } from "react";
import Papa from "papaparse";
import CsvTable from "./components/CsvTable";

function App() {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: (result) => {
        setData(result.data);
      },
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Validador de CSV - Cálculo de MBR</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {data.length > 0 && <CsvTable rows={data} />}
    </div>
  );
}

export default App;

