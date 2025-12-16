import React from 'react';

export default function MostUndervaluedStocks() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">Most Undervalued Stocks</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left py-1">Symbol</th>
            <th className="text-left py-1">Name</th>
            <th className="text-left py-1">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1">INTC</td>
            <td>Intel Corp</td>
            <td className="text-green-600">+2.1%</td>
          </tr>
          <tr>
            <td className="py-1">F</td>
            <td>Ford Motor</td>
            <td className="text-green-600">+1.8%</td>
          </tr>
          <tr>
            <td className="py-1">GE</td>
            <td>General Electric</td>
            <td className="text-green-600">+1.5%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
