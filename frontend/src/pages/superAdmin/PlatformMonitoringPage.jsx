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
  TrendingUp 
} from 'lucide-react';

const PlatformMonitoringPage = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Platform Health & Infrastructure Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time status of Node.js API servers, MongoDB Atlas cluster, latency metrics, and API request throughput
          </p>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>API Server Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Port 5000 • Express MVC</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>MongoDB Atlas Cluster</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>CONNECTED</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">cluster0.7jdgxrh.mongodb.net</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>API Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">24 ms</div>
          <div className="text-[11px] text-emerald-400 font-medium">Ultra-Fast Response</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Uptime Metric</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400">99.98%</div>
          <div className="text-[11px] text-slate-500">SLA Standard Compliant</div>
        </div>

      </div>

      {/* System Resource Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Node.js Memory & Event Loop Utilization</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Heap Memory Used</span>
                <span className="text-emerald-400 font-mono">48.2 MB / 512 MB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Active Database Connections</span>
                <span className="text-cyan-400 font-mono">14 Pool Sockets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>JWT Authentication Token Cache</span>
                <span className="text-teal-400 font-mono">Clean / Validated</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Recent System Logins</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-white font-bold">Sahakara Super Admin (superadmin)</div>
                <div className="text-slate-500 text-[11px]">Role: Super Admin • IP: 127.0.0.1</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">SUCCESS</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-white font-bold">Vijaya Society Admin (orgadmin)</div>
                <div className="text-slate-500 text-[11px]">Role: Organization Admin • IP: 127.0.0.1</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">SUCCESS</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PlatformMonitoringPage;
