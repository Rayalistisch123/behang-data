import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

type ExcelUploaderProps = {
  onDataLoaded: (data: any[], sheetName: string) => void;
};

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataLoaded }) => {
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data.xlsx")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsBinaryString(blob);
        reader.onload = (e) => {
          const binaryString = e.target?.result;
          const workbook = XLSX.read(binaryString, { type: "binary" });

          const sheetNames = workbook.SheetNames;
          setSheets(sheetNames);
          setSelectedSheet(sheetNames[0]);

          const firstSheet = workbook.Sheets[sheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          onDataLoaded(jsonData, sheetNames[0]);
        };
      })
      .catch((error) => console.error("Fout bij laden van bestand:", error));
  }, []);

  const handleSheetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetName = event.target.value;
    setSelectedSheet(sheetName);

    fetch("/data.xlsx")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsBinaryString(blob);
        reader.onload = (e) => {
          const binaryString = e.target?.result;
          const workbook = XLSX.read(binaryString, { type: "binary" });

          const selectedSheetData = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(selectedSheetData);
          onDataLoaded(jsonData, sheetName);
        };
      })
      .catch((error) => console.error("Fout bij laden van bestand:", error));
  };

  return (
    <div className="p-6 bg-gray-100 border rounded-lg shadow-md">
      {sheets.length > 0 && (
        <div className="mt-4">
          <label className="text-gray-700 font-semibold">Selecteer maand:</label>
          <select
            value={selectedSheet || ""}
            onChange={handleSheetChange}
            className="border p-2 rounded-md bg-white shadow-sm mt-2 w-full"
          >
            {sheets.map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;
