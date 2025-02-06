import React from "react";

type DataTableProps = {
  data: any[];
};

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (data.length === 0) return <p className="text-gray-600 text-center">Geen data beschikbaar.</p>;

  const headers = Object.keys(data[0]);

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border p-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition">
                {headers.map((header) => (
                  <td key={header} className="border p-2">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
