import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const BestSellingDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  if (!data.length) {
    return <h2 className="text-center text-red-500">❌ Geen data beschikbaar.</h2>;
  }

  // ✅ Bereken omzet per product (Aantal verkocht * Prijs incl. BTW)
  const omzetPerBehang = () => {
    const omzetData: { [key: string]: { omzet: number; aantal: number } } = {};

    data.forEach((item) => {
      const soort = item["Soort"];
      const naam = item["Naam"];
      const kleur = item["Kleur"];
      const prijsInclBtw = item["Prijs incl. BTW"];

      // ✅ Controleer of het een behangproduct is
      if (["standaard behang", "behangcirkel", "custom behang"].includes(soort)) {
        const key = `${naam} - ${kleur} (${soort})`;

        if (!omzetData[key]) {
          omzetData[key] = { omzet: 0, aantal: 0 };
        }

        omzetData[key].omzet += prijsInclBtw;
        omzetData[key].aantal += 1;
      }
    });

    return Object.entries(omzetData)
      .map(([name, values]) => ({
        name,
        omzet: values.omzet,
        aantal: values.aantal,
      }))
      .sort((a, b) => b.omzet - a.omzet)
      .slice(0, 5); // Top 5 best verkochte behang
  };

  const bestSellingData = omzetPerBehang();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold">💰 Behang met Hoogste Omzet</h1>

      {/* Best verkochte behangen */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-6 w-full">
        <h2 className="text-gray-700 font-semibold text-xl mb-4">Top 5 Behang met Hoogste Omzet</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bestSellingData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="omzet" fill="#4F46E5" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Omzet en aantal verkopen */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-6 w-full">
        <h2 className="text-gray-700 font-semibold text-xl mb-4">📋 Overzicht Omzet per Behang</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-[linear-gradient(to_right,_#f191bc,_#f8cccf)] text-white">
              <th className="border p-2 text-left">Behang (Naam - Kleur - Type)</th>
              <th className="border p-2 text-center">Aantal verkocht</th>
              <th className="border p-2 text-center">Totale omzet (€)</th>
            </tr>
          </thead>
          <tbody>
            {bestSellingData.map((row) => (
              <tr key={row.name} className="border">
                <td className="border p-2">{row.name}</td>
                <td className="border p-2 text-center">{row.aantal}</td>
                <td className="border p-2 text-center font-bold">€{row.omzet.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestSellingDashboard;
