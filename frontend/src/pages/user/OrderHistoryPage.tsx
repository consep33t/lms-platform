import React from 'react';

const mockOrders = [
  { id: 'ORD-001', moduleName: 'Advanced React Patterns', date: '2026-08-15', amount: 450000, status: 'Paid' },
  { id: 'ORD-002', moduleName: 'Node.js Microservices', date: '2026-08-16', amount: 300000, status: 'Pending' },
  { id: 'ORD-003', moduleName: 'GraphQL Mastery', date: '2026-08-10', amount: 500000, status: 'Failed' },
];

export default function OrderHistoryPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      
      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">Order ID</th>
              <th className="p-4 font-semibold text-gray-700">Module</th>
              <th className="p-4 font-semibold text-gray-700">Date</th>
              <th className="p-4 font-semibold text-gray-700">Amount</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.moduleName}</td>
                <td className="p-4">{order.date}</td>
                <td className="p-4">Rp {order.amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'Failed' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:underline">
                    View / Download Invoice
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
