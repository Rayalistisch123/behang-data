import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const GeoDashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [geoData, setGeoData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/verkoopdata_2024.json");
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

  useEffect(() => {
    if (data.length === 0) return;

    const salesData: { [key: string]: number } = {};
    data.forEach((item) => {
      const plaats = item["Plaatsnaam"];
      if (!plaats) return;
      salesData[plaats] = (salesData[plaats] || 0) + 1;
    });

    setGeoData(salesData);
  }, [data]);

  if (loading)
    return <h2 className="text-center text-gray-500">🔄 Data laden...</h2>;
  if (!data.length)
    return (
      <h2 className="text-center text-red-500">❌ Geen data beschikbaar.</h2>
    );

  const salesByLocation = Object.entries(geoData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);


  const coordinatesMap: { [key: string]: [number, number] } = {
    Amsterdam: [52.3676, 4.9041],
    Rotterdam: [51.9244, 4.4777],
    Utrecht: [52.0907, 5.1214],
    "Den Haag": [52.0705, 4.3007],
    Eindhoven: [51.4416, 5.4697],
    Enschede: [52.2215, 6.8937],

  };


  const markers = salesByLocation
    .filter((row) => coordinatesMap[row.name])
    .map((row) => ({
      name: row.name,
      value: row.value,
      coordinates: coordinatesMap[row.name],
    }));


  const defaultCenter: [number, number] =
    markers.length > 0 ? markers[0].coordinates : [52.3676, 4.9041];

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold text-center">
        🌍 Geografische Verkoopanalyse
      </h1>

      {/* Top 10 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-gray-700 font-semibold text-xl mb-4">
          📊 Top 10 Verkooplocaties
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByLocation.slice(0, 10)}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Kaart met indicatieve markers */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-gray-700 font-semibold text-xl mb-4">
          📍 Verkooplocaties op de Kaart
        </h3>
        <MapContainer
          center={defaultCenter}
          zoom={8}
          scrollWheelZoom={false}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.coordinates}>
              <Popup>
                {marker.name}: {marker.value} verkochte behangen.
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Tabel met plaatsnaam */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-gray-700 font-semibold text-xl mb-4">
          📋 Overzicht Verkoop per Plaats
        </h3>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Plaatsnaam</th>
              <th className="border p-2 text-center">Verkochte behangen</th>
            </tr>
          </thead>
          <tbody>
            {salesByLocation.map((row) => (
              <tr key={row.name} className="border">
                <td className="border p-2">{row.name}</td>
                <td className="border p-2 text-center">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeoDashboard;
