import React, { useEffect, useState } from 'react';
import { getJournalEntries } from '../../services/api';

const JournalEntryPage = () => {
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    getJournalEntries().then(res => setJournals(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Journal Entries</h1>
      <div className="space-y-6">
        {journals.map(j => (
          <div key={j._id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-white font-bold">{j.entryNumber}</h3>
                <p className="text-sm text-slate-400">{new Date(j.entryDate).toLocaleString()} - {j.description}</p>
              </div>
              <div className="text-right">
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">Ref: {j.referenceType}</span>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Account</th>
                  <th className="pb-2 text-right">Debit</th>
                  <th className="pb-2 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {j.lines.map(line => (
                  <tr key={line._id} className="border-t border-slate-700/50">
                    <td className="py-2 text-slate-300">
                      <span className="font-mono text-xs mr-2">{line.accountId?.accountCode}</span>
                      {line.accountId?.accountName}
                    </td>
                    <td className="py-2 text-emerald-400 text-right">{line.debit > 0 ? line.debit : ''}</td>
                    <td className="py-2 text-rose-400 text-right">{line.credit > 0 ? line.credit : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
export default JournalEntryPage;
