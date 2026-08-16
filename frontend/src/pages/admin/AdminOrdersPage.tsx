import React, { useState } from 'react';

const mockOrders = [
  { id: 'ORD-001', user: 'Alice', moduleName: 'Advanced React Patterns', amount: 450000, status: 'Paid' },
  { id: 'ORD-002', user: 'Bob', moduleName: 'Node.js Microservices', amount: 300000, status: 'Pending' },
];

export default function AdminOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Orders & Revenue</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">Rp 12.500.000</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Orders Today</h3>
          <p className="text-3xl font-bold mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Active Coupons</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
      <div className="bg-white border rounded shadow-sm overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">Order ID</th>
              <th className="p-4 font-semibold text-gray-700">User</th>
              <th className="p-4 font-semibold text-gray-700">Module</th>
              <th className="p-4 font-semibold text-gray-700">Amount</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.user}</td>
                <td className="p-4">{order.moduleName}</td>
                <td className="p-4">Rp {order.amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. SUMMER50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (Rp)</label>
                <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 50000" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
