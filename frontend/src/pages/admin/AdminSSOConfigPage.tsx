import React, { useState } from 'react';

export default function AdminSSOConfigPage() {
  const [protocol, setProtocol] = useState('SAML');
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Konfigurasi SSO Korporat</h1>
      
      <div className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Protokol SSO</label>
          <select 
            value={protocol} 
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="SAML">SAML 2.0</option>
            <option value="OIDC">OIDC</option>
            <option value="LDAP">LDAP</option>
          </select>
        </div>

        {protocol === 'SAML' && (
          <>
            <div>
              <label className="block font-medium mb-1">Entity ID (Issuer)</label>
              <input type="text" className="w-full border p-2 rounded" placeholder="https://idp.example.com/metadata" />
            </div>
            <div>
              <label className="block font-medium mb-1">Certificate X.509</label>
              <textarea className="w-full border p-2 rounded" rows={4} placeholder="-----BEGIN CERTIFICATE-----..." />
            </div>
          </>
        )}

        {protocol === 'OIDC' && (
          <>
            <div>
              <label className="block font-medium mb-1">Client ID</label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">Client Secret</label>
              <input type="password" className="w-full border p-2 rounded" />
            </div>
          </>
        )}

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Attribute Claim Mapping</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">LMS Attribute</th>
                <th className="border p-2 text-left">IdP Claim</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Email</td>
                <td className="border p-2"><input type="text" className="w-full border p-1" defaultValue="email" /></td>
              </tr>
              <tr>
                <td className="border p-2">First Name</td>
                <td className="border p-2"><input type="text" className="w-full border p-1" defaultValue="given_name" /></td>
              </tr>
              <tr>
                <td className="border p-2">Last Name</td>
                <td className="border p-2"><input type="text" className="w-full border p-1" defaultValue="family_name" /></td>
              </tr>
              <tr>
                <td className="border p-2">Department</td>
                <td className="border p-2"><input type="text" className="w-full border p-1" defaultValue="department" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex gap-4 pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Test Connection
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Manual Sync
          </button>
          <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 ml-auto">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
