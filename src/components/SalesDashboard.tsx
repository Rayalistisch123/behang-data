import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const SalesDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("Alle maanden");

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
      setLoading(true);
      try {
        const response = await fetch("/verkoopdata_2024.json"); // Lokaal JSON-bestand
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("❌ Fout bij het laden van de gegevens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <h2 className="text-center text-gray-500">🔄 Data laden...</h2>;
  }

  if (!data || data.length === 0) {
    return <h2 className="text-center text-red-500">❌ Geen data beschikbaar.</h2>;
  }

  // Filter data op geselecteerde maand
  const filteredData =
    selectedMonth === "Alle maanden"
      ? data
      : data.filter((item) => item["Maand"] === selectedMonth);

  // Data groeperen per categorie
  const countByField = (field: string, topN: number = 5) => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach((item) => {
      if (!item[field]) return;
      counts[item[field]] = (counts[item[field]] || 0) + 1;
    });

    const sortedCounts = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN);

    return sortedCounts.map(([key, value]) => ({ name: key, value }));
  };

  // Data groeperen op combinaties
  const countByCombination = (field1: string, field2: string, topN: number = 5) => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach((item) => {
      const value1 = item[field1];
      const value2 = item[field2];
      if (!value1 || !value2) return;

      const combination = `${value1} (${value2})`; // Combineer Naam en Kleur
      counts[combination] = (counts[combination] || 0) + 1;
    });

    const sortedCounts = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN);

    return sortedCounts.map(([key, value]) => ({ name: key, value }));
  };

  // Data voor grafieken
  const salesBySoort = countByField("Soort");
  const salesByKleur = countByField("Kleur");
  const salesByAfmeting = countByField("Afmeting");
  const salesByPlaatsnaam = countByField("Plaatsnaam");
  const salesByCombination = countByCombination("Naam", "Kleur");
  const salesByNaam = countByField("Naam");

  // Kleuren voor PieCharts
  const colors = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        📈 Verkoop & Omzet Dashboard
      </h1>

      {/* Dropdown voor maandfilter */}
      <div className="flex flex-col sm:flex-row items-center justify-center mb-6">
        <label className="mr-2 font-semibold text-gray-700 mb-2 sm:mb-0">
          Selecteer Maand:
        </label>
        <select
          className="p-2 border rounded-md"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthsList.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Verkoop per Soort */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-gray-700 font-semibold text-xl mb-4">
          📊 Verkoop per Soort
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesBySoort}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="pink" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Extra statistieken in Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        {/* Verkoop per Kleur */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-700 font-semibold text-xl mb-4">
            🎨 Verkoop per Kleur
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesByKleur}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#F59E0B"
                dataKey="value"
              >
                {salesByKleur.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Verkoop per Combinatie */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-700 font-semibold text-xl mb-4">
            🏆 Beste Combinaties (Naam + Kleur)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByCombination}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="pink" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verkoop per Naam */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-700 font-semibold text-xl mb-4">
            🏷️ Verkoop per Naam
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesByNaam}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8B5CF6"
                dataKey="value"
              >
                {salesByNaam.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Verkoop per Afmeting */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-700 font-semibold text-xl mb-4">
            📐 Verkoop per Afmeting
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesByAfmeting}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#10B981"
                dataKey="value"
              >
                {salesByAfmeting.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Verkoop per Plaatsnaam */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-700 font-semibold text-xl mb-4">
            📍 Verkoop per Plaatsnaam
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesByPlaatsnaam}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#EF4444"
                dataKey="value"
              >
                {salesByPlaatsnaam.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
