'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Fingerprint, Database, History, Play, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';

export default function SecurityScansPage() {
  useAutoLoadToken();

  const [activeTab, setActiveTab] = useState<'scans' | 'findings' | 'history'>('scans');

  const projectId = 'e8b8c2d2-1111-4444-8888-abcdef123456'; 
  
  const { data: scansData, loading: scansLoading, refetch: refetchScans } = useApiData(() => api.request<any>('GET', `/security-scans?projectId=${projectId}`));
  const scans = scansData?.data || [];

  const handleRunScan = async (type: string) => {
    try {
      await api.request('POST', `/security-scans/trigger`, {
        projectId,
        type
      });
      alert(`${type} scan triggered successfully!`);
      refetchScans();
    } catch (error) {
      alert('Failed to trigger scan');
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Security</h1>
              <p className="text-xs text-white/50">Audit & Scanners</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('scans')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === 'scans'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Scanners</span>
            </button>
            <button
              onClick={() => setActiveTab('findings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === 'findings'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Findings</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Scan History</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeTab === 'scans' ? 'Security Scanners' : activeTab === 'findings' ? 'Active Findings' : 'Scan History'}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              Automated dependency and secret scanning for infrastructure safety.
            </p>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'scans' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Database className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Dependency Scanner</h3>
                      <span className="text-xs text-white/50 tracking-wider">
                        npm / composer
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-6 text-sm text-white/70">
                  <p>Scans package.json, package-lock.json, and composer.lock files for known vulnerabilities.</p>
                </div>
                <button 
                  onClick={() => handleRunScan('dependency')}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Audit</span>
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Fingerprint className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Secret Scanner</h3>
                      <span className="text-xs text-white/50 tracking-wider">
                        trufflehog / gitleaks
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-6 text-sm text-white/70">
                  <p>Scans the codebase for hardcoded API keys, passwords, AWS tokens, and SSH keys.</p>
                </div>
                <button 
                  onClick={() => handleRunScan('secret')}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Scan Secrets</span>
                </button>
              </div>

            </div>
          )}

          {activeTab === 'findings' && (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 text-center text-white/50">
                <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Active Findings</h3>
                <p className="text-sm">Your codebase is currently free of known critical vulnerabilities and hardcoded secrets.</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Scan ID</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Findings</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {scans.length > 0 ? scans.map((scan: any) => (
                    <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white/70">{scan.id.split('-')[0]}</td>
                      <td className="px-6 py-4 text-white capitalize">{scan.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${scan.criticalCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {scan.criticalCount} Critical, {scan.highCount} High
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center text-white/70 capitalize">
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50">{timeAgo(scan.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-white/50">No scan history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
