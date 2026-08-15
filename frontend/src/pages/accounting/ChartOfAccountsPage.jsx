import React, { useEffect, useState } from 'react';
import { getChartOfAccounts } from '../../services/api';

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    getChartOfAccounts().then(res => setAccounts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Chart of Accounts</h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="p-4 text-slate-300 font-medium">Code</th>
              <th className="p-4 text-slate-300 font-medium">Name</th>
              <th className="p-4 text-slate-300 font-medium">Type</th>
              <th className="p-4 text-slate-300 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc._id} className="border-b border-slate-700/50 hover:bg-slate-750">
                <td className="p-4 text-slate-300">{acc.accountCode}</td>
                <td className="p-4 text-white font-medium">{acc.accountName}</td>
                <td className="p-4 text-slate-400">{acc.accountType}</td>
                <td className="p-4 text-emerald-400 font-medium">₹{acc.currentBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ChartOfAccountsPage;
