'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface MarketList {
  _id: string;
  slug: string;
  title: string;
  description: string;
  computed: {
    type: string;
    refresh_seconds: number;
  };
  visibility: string;
  last_updated: string;
}

export default function MarketListsPage() {
  const [marketLists, setMarketLists] = useState<MarketList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketLists();
  }, []);

  const fetchMarketLists = async () => {
    try {
      const response = await fetch('/api/admin/market-lists');
      if (response.ok) {
        const data = await response.json();
        setMarketLists(data);
      }
    } catch (error) {
      console.error('Error fetching market lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMarketList = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this market list?')) return;

    try {
      const response = await fetch(`/api/admin/market-lists/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMarketLists(marketLists.filter(list => list.slug !== slug));
      }
    } catch (error) {
      console.error('Error deleting market list:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Market Lists</h1>
        <Link
          href="/admin/market-lists/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          New Market List
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketLists.map((list) => (
              <tr key={list._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {list.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {list.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {list.computed.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {list.visibility}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(list.last_updated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/market-lists/${list.slug}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => deleteMarketList(list.slug)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
