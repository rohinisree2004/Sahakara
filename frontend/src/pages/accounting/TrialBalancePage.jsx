import React, { useEffect, useState } from 'react';
import { getTrialBalance } from '../../services/api';

const TrialBalancePage = () => {
  const [tb, setTb] = useState(null);

  useEffect(() => {
    getTrialBalance().then(res => setTb(res.data)).catch(console.error);
  }, []);

  if (!tb) return <div className="p-8 text-white">Loading Trial Balance...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Trial Balance</h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="p-4 text-slate-300 font-medium">Code</th>
              <th className="p-4 text-slate-300 font-medium">Account Name</th>
              <th className="p-4 text-slate-300 font-medium text-right">Debit</th>
              <th className="p-4 text-slate-300 font-medium text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {tb.lines.map(line => (
              <tr key={line.accountId} className="border-b border-slate-700/50 hover:bg-slate-750">
                <td className="p-4 text-slate-400">{line.accountCode}</td>
                <td className="p-4 text-white">{line.accountName}</td>
                <td className="p-4 text-slate-300 text-right">{line.debit > 0 ? `₹${line.debit}` : '-'}</td>
                <td className="p-4 text-slate-300 text-right">{line.credit > 0 ? `₹${line.credit}` : '-'}</td>
              </tr>
            ))}
            <tr className="bg-slate-900 font-bold border-t-2 border-slate-600">
              <td className="p-4 text-white text-right" colSpan={2}>TOTALS:</td>
              <td className="p-4 text-indigo-400 text-right">₹{tb.totalDebit}</td>
              <td className="p-4 text-indigo-400 text-right">₹{tb.totalCredit}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={`mt-4 p-4 rounded-xl font-medium ${tb.isBalanced ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
        Status: {tb.isBalanced ? 'BALANCED' : 'UNBALANCED'}
      </div>
    </div>
  );
};
export default TrialBalancePage;
