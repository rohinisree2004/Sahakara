import React from 'react';
import { Loader2 } from 'lucide-react';

const EmiSchedulePage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );
};
export default EmiSchedulePage;
