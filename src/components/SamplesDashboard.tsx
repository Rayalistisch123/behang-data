import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ConversionItem = {
  name: string;
  sales: number;
  samples: number;
  conversionRate: number;
  // Extra property om per verkoopsoort de aantallen bij te houden
  salesByType: { [type: string]: number };
};

const SamplesDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("Alle maanden");
  const [selectedSample, setSelectedSample] = useState<string>("");
  const [conversionData, setConversionData] = useState<ConversionItem[]>([]);
  const [displayedRows, setDisplayedRows] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sorteerconfiguratie
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ConversionItem;
    direction: "ascending" | "descending";
  } | null>(null);

  const monthsList = [
    "Alle maanden",
    "januari 2024",
    "februari 2024",
    "maart 2024",
    "april 2024",
    "mei 2024",
    "juni 2024",
    "juli 2024",
    "augustus 2024",
    "september 2024",
    "oktober 2024",
    "november 2024",
    "december 2024",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/verkoopdata_2024.json");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("❌ Fout bij het laden van de gegevens:", error);
      }
    };

    fetchData();
  }, []);

  // Filter data op basis van maand en sample
  const filteredData = useMemo(() => {
    let fd =
      selectedMonth === "Alle maanden"
        ? data
        : data.filter((item) => item["Maand"] === selectedMonth);

    if (selectedSample) {
      fd = fd.filter((item) => item["Naam"] === selectedSample);
    }
    return fd;
  }, [data, selectedMonth, selectedSample]);

  /**
   * We groeperen de data op sample (naam en kleur).
   * Voor sample-bestellingen (soort === "staaltje") verhogen we de sample-count.
   * Voor verkopen (soort !== "staaltje") verhogen we de totale verkoop en slaan we
   * de verkoop per soort (bijv. "standaard behang", "behangcirkel", "custom behang") op.
   */
  const calculateSampleConversion = () => {
    const sampleCounts: {
      [key: string]: { samples: number; totalSales: number; salesByType: { [type: string]: number } };
    } = {};

    filteredData.forEach((item) => {
      const klantNaam = item["Naam Klant"];
      const soort = item["Soort"];
      const naam = item["Naam"];
      const kleur = item["Kleur"];
      // Eventueel andere velden zoals afmeting kunnen hier ook worden meegenomen

      if (!klantNaam || !soort || !naam || !kleur) return;

      // Groepeer op naam en kleur (sample-bestellingen worden hier samen gevoegd)
      const key = `${naam} - ${kleur}`;

      if (!sampleCounts[key]) {
        sampleCounts[key] = { samples: 0, totalSales: 0, salesByType: {} };
      }

      if (soort === "staaltje") {
        sampleCounts[key].samples += 1;
      } else {
        sampleCounts[key].totalSales += 1;
        sampleCounts[key].salesByType[soort] = (sampleCounts[key].salesByType[soort] || 0) + 1;
      }
    });

    return Object.entries(sampleCounts).map(([key, values]) => ({
      name: key,
      samples: values.samples,
      sales: values.totalSales,
      conversionRate: values.samples > 0 ? (values.totalSales / values.samples) * 100 : 0,
      salesByType: values.salesByType,
    }));
  };

  useEffect(() => {
    setConversionData(calculateSampleConversion());
  }, [filteredData]);

  const totalSamples = conversionData.reduce((sum, item) => sum + item.samples, 0);
  const totalSales = conversionData.reduce((sum, item) => sum + item.sales, 0);
  const averageConversionRate = totalSamples > 0 ? (totalSales / totalSamples) * 100 : 0;
  const bestSample =
    conversionData.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.name || "Geen data";

  const requestSort = (key: keyof ConversionItem) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...conversionData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [conversionData, sortConfig]);

  // Zoekfunctie: filter de gesorteerde data op basis van de zoekopdracht
  const searchedData = useMemo(() => {
    if (!searchQuery) return sortedData;
    return sortedData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedData, searchQuery]);

  // Functie om de tabeldata als CSV te exporteren
  const exportCSV = () => {
    const header = ["Naam", "Staaltjes", "Verkoop", "Conversie (%)", "Verkoop details"];
    const rows = searchedData.slice(0, displayedRows).map((item) => [
      item.name,
      item.samples,
      item.sales,
      item.conversionRate.toFixed(2),
      // Verkoop details als een string, bijvoorbeeld: "standaard behang: 3, behangcirkel: 2"
      Object.entries(item.salesByType)
        .map(([type, count]) => `${type}: ${count}`)
        .join(" | "),
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "staaltjes_overzicht.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center">📊 Staaltjes Conversie Dashboard</h1>

      {/* KPI Kaarten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <h3 className="text-sm md:text-lg font-semibold">📦 Totaal Staaltjes</h3>
          <p className="text-xl md:text-2xl font-bold text-blue-500">{totalSamples}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <h3 className="text-sm md:text-lg font-semibold">🛒 Totaal Verkochte Behangen</h3>
          <p className="text-xl md:text-2xl font-bold text-green-500">{totalSales}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <h3 className="text-sm md:text-lg font-semibold">📈 Gem. Conversie</h3>
          <p className="text-xl md:text-2xl font-bold text-purple-500">
            {averageConversionRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <h3 className="text-sm md:text-lg font-semibold">🏆 Beste Staaltje</h3>
          <p className="text-xl md:text-2xl font-bold text-yellow-500">{bestSample}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 my-4">
        <select
          className="p-2 border rounded-md w-full md:w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthsList.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded-md w-full md:w-auto"
          value={selectedSample}
          onChange={(e) => setSelectedSample(e.target.value)}
        >
          <option value="">Alle Staaltjes</option>
          {[...new Set(data.map((item) => item["Naam"]))].map((sample) => (
            <option key={sample} value={sample}>
              {sample}
            </option>
          ))}
        </select>
      </div>

      {/* Grafiek */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full">
        <h3 className="text-gray-700 font-semibold text-xl mb-4">
          📊 Conversie per Staaltje (%)
        </h3>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversionRate" fill="pink" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel met zoekbalk */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full overflow-x-auto">
        <h3 className="text-black-700 font-semibold text-xl mb-4">📋 Overzicht Staaltjes</h3>

        {/* Zoekbalk */}
        <div className="flex justify-end mb-4 text-black">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek op naam..."
            className="border rounded p-2"
          />
        </div>

        <table className="min-w-full bg-white border border-gray-300">
          <thead  style={{ backgroundImage: "linear-gradient(to right, #f191bc, #f8cccf)" }}>
            <tr>
              <th
                className="border p-2 text-left cursor-pointer text-white"
                onClick={() => requestSort("name")}
              >
                Naam{" "}
                {sortConfig?.key === "name"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border p-2 text-center cursor-pointer text-white"
                onClick={() => requestSort("samples")}
              >
                Staaltjes{" "}
                {sortConfig?.key === "samples"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border p-2 text-center cursor-pointer text-white"
                onClick={() => requestSort("sales")}
              >
                Verkoop{" "}
                {sortConfig?.key === "sales"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="border p-2 text-center cursor-pointer text-white"
                onClick={() => requestSort("conversionRate")}
              >
                Conversie (%)
                {sortConfig?.key === "conversionRate"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th className="border p-2 text-center text-white">Verkoop details</th>
            </tr>
          </thead>
          <tbody>
            {searchedData.slice(0, displayedRows).map((row) => (
              <tr key={row.name} className="border">
                <td className="border p-2">{row.name}</td>
                <td className="border p-2 text-center">{row.samples}</td>
                <td className="border p-2 text-center">{row.sales}</td>
                <td className="border p-2 text-center font-bold">
                  {row.conversionRate.toFixed(2)}%
                </td>
                <td className="border p-2 text-center">
                  {Object.entries(row.salesByType)
                    .map(([type, count]) => `${type}: ${count}`)
                    .join(" | ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Knoppen: Laad meer & Exporteer als CSV */}
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setDisplayedRows((prev) => prev + 10)}
            style={{ backgroundImage: 'linear-gradient(to right, #f191bc, #f8cccf)' }}
            className="bg-pink-300 text-white p-2 rounded"
          >
            Laad meer...
          </button>
          <button
            style={{ backgroundImage: 'linear-gradient(to right, #f191bc, #f8cccf)' }}
            onClick={exportCSV}
            className="bg-pink-300 text-white p-2 rounded"
          >
            Exporteer als CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default SamplesDashboard;
