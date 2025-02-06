import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type InfoCardsProps = {
  data: any[];
};

const getChartData = (data: any[], key: string) => {
  const counts: { [key: string]: number } = {};

  data.forEach((item) => {
    const value = item[key] || "Onbekend";
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.keys(counts).map((key) => ({ name: key, count: counts[key] }));
};

const InfoCards: React.FC<InfoCardsProps> = ({ data }) => {
  const [isBarChart, setIsBarChart] = useState(true); // Toggle staat standaard op staafdiagram

  const soorten = getChartData(data, "Soort");
  const namen = getChartData(data, "Naam");
  const kleuren = getChartData(data, "Kleur");
  const prijzen = getChartData(data, "Prijs incl. BTW");

  return (
    <div>
      {/* Toggle knopje */}
      <div className="text-right mb-4">
        <button
          onClick={() => setIsBarChart(!isBarChart)}
          className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md shadow hover:bg-blue-700 transition"
        >
          {isBarChart ? "Lijngrafiek" : "Staafgrafiek"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{ title: "Soort", data: soorten }, { title: "Naam", data: namen }, { title: "Kleur", data: kleuren }, { title: "Prijs incl. BTW", data: prijzen }].map(
          ({ title, data }) => (
            <div key={title} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
              <ResponsiveContainer width="100%" height={200}>
                {isBarChart ? (
                  <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="pink" />
                  </BarChart>
                ) : (
                  <LineChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4F46E5" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InfoCards;
