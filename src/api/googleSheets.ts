import axios from "axios";

const SHEET_ID = "1AqYXpNBZPoZ-slC0Pp2s7CcsIWacl6OTt399WifYeDg"; // ✅ Vervang met je echte ID

// ✅ Voeg hier ALLE tabbladnamen toe
const SHEET_TABS = [
  "januari 2024", "februari 2024", "maart 2024", "april 2024",
  "mei 2024", "juni 2024", "juli 2024", "augustus 2024",
  "september 2024", "oktober 2024", "november 2024", "december 2024"
];

export const fetchGoogleSheetData = async () => {
  try {
    console.log("📡 Ophalen van Google Sheets data...");
    
    let allData: any[] = [];

    for (const sheet of SHEET_TABS) {
      // ✅ FIX: encodeURIComponent voorkomt problemen met spaties in de URL
      const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`;

      console.log(`🔗 API URL: ${SHEET_URL}`);
      
      const response = await axios.get(SHEET_URL);

      // ✅ Google Sheets API retourneert rare JSON, we halen de extra tekst eraf
      const jsonText = response.data
        .replace("/*O_o*/", "")
        .replace("google.visualization.Query.setResponse(", "")
        .slice(0, -2);

      console.log(`✅ Geparste JSON-tekst voor tabblad "${sheet}":`, jsonText);

      const jsonData = JSON.parse(jsonText);
      
      if (!jsonData.table) {
        console.warn(`🚨 Geen 'table' data gevonden in tabblad "${sheet}"`);
        continue;
      }

      // ✅ Headers ophalen
      const headers = jsonData.table.cols.map((col: any) => col.label);
      console.log(`📝 Headers voor "${sheet}":`, headers);

      // ✅ Data omzetten naar een bruikbaar formaat
      const rows = jsonData.table.rows.map((row: any) =>
        row.c.map((cell: any) => (cell ? cell.v : ""))
      );

      console.log(`🔍 Ruwe rijen voor "${sheet}":`, rows);

      // ✅ Data in een array van objecten zetten
      const formattedData = rows.map((row: any) =>
      Object.fromEntries(headers.map((header: string, index: number) => [header, row[index]]))
    );

      console.log(`✅ Geformatteerde data voor "${sheet}":`, formattedData);

      allData = [...allData, ...formattedData]; // ✅ Combineer alle tabbladen
    }

    console.log("🎯 Alle tabbladen samengevoegd:", allData);
    return allData;
  } catch (error) {
    console.error("❌ Fout bij ophalen van Google Sheets:", error);
    return [];
  }
};
