import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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
        className="w-full max-w-md px-4 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
      />

      <div className="nocturne-surface rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-text-muted border-b border-border">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-right">Orders</th>
              <th className="p-4 text-right">Total Spending</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono-tabular">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-sans">
                  <p className="font-semibold text-text">{c.name}</p>
                  <p className="text-[11px] text-text-muted">{c.email}</p>
                </td>
                <td className="p-4 text-text-soft">{c.phone}</td>
                <td className="p-4 text-right text-text">{c.totalOrders}</td>
                <td className="p-4 text-right text-green-light">
                  ${c.totalSpending.toFixed(2)}
                </td>
                <td className="p-4 font-sans">
                  <Badge
                    variant={c.status === 'ACTIVE' ? 'success' : 'danger'}
                    dot
                  >
                    {c.status}
                  </Badge>
                </td>
                <td className="p-4 text-right font-sans">
                  <Button
                    type="button"
                    variant={c.status === 'ACTIVE' ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => onToggleCustomer(c.id)}
                  >
                    {c.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
