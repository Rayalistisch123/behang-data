import React, { useEffect, useState } from "react";
import { fetchGoogleSheetData } from "../api/googleSheets";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const HomeDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const sheetData = await fetchGoogleSheetData();
      setData(sheetData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <h2 className="text-center text-gray-500">🔄 Data laden...</h2>;
  }

  if (!data || data.length === 0) {
    return <h2 className="text-center text-red-500">❌ Geen data beschikbaar.</h2>;
  }

  // **Omzet per maand**
  const salesByMonth: { [key: string]: number } = {};
  data.forEach((item) => {
    const month = new Date(item["Datum"]).toLocaleString("nl-NL", { month: "short" });
    salesByMonth[month] = (salesByMonth[month] || 0) + parseFloat(item["Prijs incl. BTW"]) || 0;
  });

  const salesChartData = Object.keys(salesByMonth).map((month) => ({
    name: month,
    Omzet: salesByMonth[month],
  }));

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold text-center">📊 Google Sheets Dashboard</h1>

      {/* Lijngrafiek Omzet per Maand */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
        <h3 className="text-gray-700 font-semibold text-xl mb-4">📈 Omzet per Maand</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Omzet" fill="#4F46E5" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HomeDashboard;
