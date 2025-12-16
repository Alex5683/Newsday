import React from 'react';

export default function SidebarWidgets() {
  return (
    <div className="flex flex-col gap-6">
      {/* Market Summary Widget */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2 text-gray-800 text-sm">Market Summary</h3>
        {/* Placeholder for mini chart or summary */}
        <div className="h-24 bg-gray-100 rounded" />
      </div>
      {/* Trending Stocks Widget */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2 text-gray-800 text-sm">Trending Stocks</h3>
        {/* Placeholder for trending stocks */}
        <ul className="text-xs text-gray-600 space-y-1">
          <li>APPL</li>
          <li>GOOGL</li>
          <li>TSLA</li>
        </ul>
      </div>
      {/* Most Undervalued Widget */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2 text-gray-800 text-sm">Most Undervalued</h3>
        {/* Placeholder for undervalued stocks */}
        <ul className="text-xs text-gray-600 space-y-1">
          <li>INTC</li>
          <li>F</li>
          <li>GE</li>
        </ul>
      </div>
      {/* Ad/Promo Widget */}
      <div className="bg-gray-50 rounded-lg shadow p-4 flex items-center justify-center h-24">
        <span className="text-xs text-gray-400">Ad Space</span>
      </div>
    </div>
  );
}
