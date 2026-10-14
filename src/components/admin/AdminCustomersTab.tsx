import React, { useState } from 'react';

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'DISABLED';
  totalOrders: number;
  totalSpending: number;
  lastOrder: string | null;
  createdAt: string;
}

interface AdminCustomersTabProps {
  customers: CustomerSummary[];
  onToggleCustomer: (id: string) => Promise<void>;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  onToggleCustomer,
}) => {
  const [customerSearch, setCustomerSearch] = useState<string>('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={customerSearch}
        onChange={(e) => setCustomerSearch(e.target.value)}
        placeholder="Search customers by name or email..."
        className="w-full max-w-md px-4 py-2.5 rounded-xl bg-[#150F20] border border-white/10 text-xs text-[#F5F2FA]"
      />

      <div className="nocturne-surface rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[#7E7394] border-b border-white/10">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-right">Orders</th>
              <th className="p-4 text-right">Total Spending</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono-tabular">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="p-4 font-sans">
                  <p className="font-semibold text-[#F5F2FA]">{c.name}</p>
                  <p className="text-[11px] text-[#7E7394]">{c.email}</p>
                </td>
                <td className="p-4 text-[#B8AFC9]">{c.phone}</td>
                <td className="p-4 text-right text-[#F5F2FA]">{c.totalOrders}</td>
                <td className="p-4 text-right text-[#10B981]">
                  ${c.totalSpending.toFixed(2)}
                </td>
                <td className="p-4 font-sans">
                  <span
                    className={
                      c.status === 'ACTIVE' ? 'text-[#10B981]' : 'text-[#F43F5E]'
                    }
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-right font-sans">
                  <button
                    type="button"
                    onClick={() => onToggleCustomer(c.id)}
                    className="px-3 py-1 rounded-lg border border-white/15 hover:border-[#8B5CF6] text-xs text-[#F5F2FA]"
                  >
                    {c.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
