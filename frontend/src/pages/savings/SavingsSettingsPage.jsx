import React from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';

const SavingsSettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-400" />
          Savings Configuration
        </h1>
        <p className="text-slate-400 mt-1">Configure global savings rules and product parameters for your society.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/50 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-amber-500 font-semibold text-sm">Under Development</h3>
          <p className="text-amber-400/80 text-xs mt-1">Global savings product templates and custom rules are scheduled for the next release phase. Default settings are currently applied system-wide.</p>
        </div>
      </div>

      {/* Form Mockup for future */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm opacity-50 pointer-events-none">
        <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700/50 pb-3">General Settings</h3>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Default Interest Rate (%)</label>
              <input type="number" defaultValue="4.5" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Minimum Opening Balance (₹)</label>
              <input type="number" defaultValue="500" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Interest Calculation Method</label>
              <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-white">
                <option>Daily Balance (Quarterly Payout)</option>
                <option>Monthly Minimum Balance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Allow Withdrawals</label>
              <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-white">
                <option>Yes, with Branch Approval</option>
                <option>No, Only Deposits</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-700/50">
            <button
              type="button"
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold opacity-80"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsSettingsPage;
