import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMemberPassbook } from '../../services/api';
import { ArrowLeft, BookOpen, Printer, Download, User, Wallet, Calendar } from 'lucide-react';

const PassbookPage = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPassbook = async () => {
      setIsLoading(true);
      try {
        const response = await fetchMemberPassbook(accountId);
        if (response.data.success) {
          setAccount(response.data.data.account);
          setTransactions(response.data.data.transactions);
        }
      } catch (error) {
        console.error('Failed to load passbook', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (accountId) loadPassbook();
  }, [accountId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <BookOpen className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Passbook Not Found</h2>
        <p>The savings passbook could not be loaded.</p>
        <Link to="/savings/accounts" className="mt-6 text-emerald-400 hover:underline">
          Return to Accounts List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Actions - hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link 
            to={`/savings/accounts/${account._id}`}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-emerald-400" />
              Digital Passbook
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Passbook
          </button>
        </div>
      </div>

      {/* Printable Passbook Container */}
      <div className="bg-white text-slate-900 rounded-lg overflow-hidden shadow-2xl print:shadow-none print:w-full">
        
        {/* Passbook Front Page (Header) */}
        <div className="p-8 border-b-4 border-emerald-600 bg-emerald-50 print:bg-transparent">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-800 uppercase tracking-widest">Sahakara ERP</h2>
              <p className="text-sm text-emerald-600 font-semibold mt-1">Multi-Coop Society</p>
              <p className="text-xs text-slate-500 mt-1">{account.branchId?.branchName} Branch</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-slate-800">SAVINGS PASSBOOK</h3>
              <p className="font-mono text-lg text-emerald-700 mt-1">{account.accountNumber}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mt-8 p-6 bg-white border border-emerald-100 rounded-lg shadow-sm">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Holder</div>
              <div className="font-bold text-lg">{account.memberId?.fullName}</div>
              <div className="text-sm text-slate-600 mt-1 flex items-center gap-1"><User className="w-4 h-4"/> Member ID: {account.memberId?.memberId}</div>
              <div className="text-sm text-slate-600 mt-1">{account.memberId?.address}</div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Type</div>
                  <div className="font-semibold text-slate-800">{account.accountType}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Issue</div>
                  <div className="font-semibold text-slate-800">{formatDate(account.openedAt)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interest Rate</div>
                  <div className="font-semibold text-slate-800">{account.interestRate}% p.a.</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="font-semibold text-slate-800">{account.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Transactions */}
        <div className="p-8">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3 border border-slate-300">Date</th>
                <th className="p-3 border border-slate-300">Particulars</th>
                <th className="p-3 border border-slate-300">Ref No.</th>
                <th className="p-3 border border-slate-300 text-right">Withdrawal (Dr.)</th>
                <th className="p-3 border border-slate-300 text-right">Deposit (Cr.)</th>
                <th className="p-3 border border-slate-300 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening Balance Row */}
              <tr>
                <td className="p-3 border border-slate-300 font-mono text-xs">{formatDate(account.openedAt)}</td>
                <td className="p-3 border border-slate-300 font-semibold text-slate-700">Account Opening Balance</td>
                <td className="p-3 border border-slate-300 text-slate-500 font-mono text-xs">OPEN</td>
                <td className="p-3 border border-slate-300 text-right text-slate-400">-</td>
                <td className="p-3 border border-slate-300 text-right text-slate-400">-</td>
                <td className="p-3 border border-slate-300 text-right font-bold">{formatCurrency(account.openingBalance)}</td>
              </tr>
              
              {/* Transaction Rows */}
              {transactions.map((txn, index) => (
                <tr key={txn._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 border border-slate-300 font-mono text-xs">{formatDate(txn.transactionDate)}</td>
                  <td className="p-3 border border-slate-300 font-medium text-slate-800">
                    {txn.transactionType === 'Deposit' ? 'By ' : 'To '}{txn.paymentMethod}
                    {txn.remarks && <span className="text-xs text-slate-500 block">{txn.remarks}</span>}
                  </td>
                  <td className="p-3 border border-slate-300 text-slate-500 font-mono text-[10px]">{txn.referenceNumber || txn.transactionId.slice(-6)}</td>
                  <td className="p-3 border border-slate-300 text-right text-rose-600 font-medium">
                    {txn.transactionType !== 'Deposit' ? formatCurrency(txn.amount) : '-'}
                  </td>
                  <td className="p-3 border border-slate-300 text-right text-emerald-600 font-medium">
                    {txn.transactionType === 'Deposit' ? formatCurrency(txn.amount) : '-'}
                  </td>
                  <td className="p-3 border border-slate-300 text-right font-bold text-slate-900">
                    {formatCurrency(txn.balanceAfterTransaction)}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500 italic">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="mt-8 flex justify-between text-xs text-slate-500 font-medium">
            <p>Generated on: {new Date().toLocaleString()}</p>
            <p>System Generated Passbook. Signatures are not required.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PassbookPage;
