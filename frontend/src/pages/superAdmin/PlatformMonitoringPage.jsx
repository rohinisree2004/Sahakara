import React from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Server, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  HardDrive,
  Network
} from 'lucide-react';

const PlatformMonitoringPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            <span>Platform Health & Infrastructure Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status of Node.js API servers, MongoDB Atlas cluster, latency metrics, and API request throughput
          </p>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>API Server Status</span>
            <Server className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span>ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Port 5001 • Express MVC</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>MongoDB Atlas Cluster</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span>CONNECTED</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Atlas Cloud • ReplicaSet</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>API Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">24 ms</div>
          <div className="text-[11px] text-teal-700 font-semibold">Ultra-Fast Response</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Uptime Metric</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-800">99.98%</div>
          <div className="text-[11px] text-slate-400">SLA Standard Compliant</div>
        </div>

      </div>

      {/* System Resource Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>Node.js Memory & Event Loop Utilization</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Heap Memory Used</span>
                <span className="text-teal-700 font-mono font-bold">48.2 MB / 512 MB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Active Database Connections</span>
                <span className="text-teal-700 font-mono font-bold">14 / 100 max</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Event Loop Latency</span>
                <span className="text-teal-700 font-mono font-bold">1.2 ms (Nominal)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Network className="w-4 h-4 text-teal-600" />
            <span>Network & API Security Status</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">SSL / TLS Protocol</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold">TLS 1.3 Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">JWT Token Rotation & Expiry</span>
              <span className="text-teal-700 font-mono font-bold">24h / Automated Expiry</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Rate Limiting Protection</span>
              <span className="text-slate-600 font-semibold">1,000 req / min per IP</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Data Backup Status</span>
              <span className="text-teal-700 font-bold">Continuous Automated Backup</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PlatformMonitoringPage;
