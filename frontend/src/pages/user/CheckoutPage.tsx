import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentGateway, setPaymentGateway] = useState('midtrans');
  
  const basePrice = 500000;
  
  const handleCalculateDiscount = () => {
    if (couponCode.toUpperCase() === 'DISC50') {
      setDiscount(50000);
    } else {
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    alert(`Processing payment via ${paymentGateway}`);
    navigate('/orders');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Module Summary</h2>
          <p className="mb-2"><strong>Module ID:</strong> {moduleId}</p>
          <p className="mb-2"><strong>Course Name:</strong> Advanced React Patterns</p>
          <p className="mb-4"><strong>Price:</strong> Rp {basePrice.toLocaleString()}</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode} 
                onChange={e => setCouponCode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 flex-grow"
                placeholder="Enter code"
              />
              <button 
                onClick={handleCalculateDiscount}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Apply
              </button>
            </div>
          </div>
          
          {discount > 0 && (
            <p className="text-green-600 mb-2">Discount applied: -Rp {discount.toLocaleString()}</p>
          )}
          
          <div className="border-t pt-4 mt-4">
            <p className="text-xl font-bold">Total: Rp {(basePrice - discount).toLocaleString()}</p>
          </div>
        </div>

        <div className="border p-4 rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-50">
              <input 
                type="radio" 
                name="gateway" 
                value="midtrans"
                checked={paymentGateway === 'midtrans'}
                onChange={() => setPaymentGateway('midtrans')}
              />
              <span>Midtrans (QRIS, GoPay, Bank Transfer)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-50">
              <input 
                type="radio" 
                name="gateway" 
                value="stripe"
                checked={paymentGateway === 'stripe'}
                onChange={() => setPaymentGateway('stripe')}
              />
              <span>Stripe (Credit Card)</span>
            </label>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
