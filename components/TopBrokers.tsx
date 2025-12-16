import React from 'react';

export default function TopBrokers() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">Top Brokers</h2>
      <div className="flex flex-wrap gap-4">
        <div className="bg-gray-50 rounded p-4 flex-1 min-w-[120px] text-center">
          <span className="font-semibold">Broker A</span>
        </div>
        <div className="bg-gray-50 rounded p-4 flex-1 min-w-[120px] text-center">
          <span className="font-semibold">Broker B</span>
        </div>
        <div className="bg-gray-50 rounded p-4 flex-1 min-w-[120px] text-center">
          <span className="font-semibold">Broker C</span>
        </div>
      </div>
    </div>
  );
}
