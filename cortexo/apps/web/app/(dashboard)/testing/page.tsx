'use client';

import { useState, useRef } from 'react';
import { Play, Plus, Clock, History, FileText, CheckCircle, XCircle, Beaker, FileSearch, Zap, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';
import { useApiData, useAutoLoadToken, timeAgo } from '@/lib/hooks';
import { useModal } from '@/components/modal-provider';

export default function TestingSuitePage() {
  useAutoLoadToken();

  const [activeTab, setActiveTab] = useState<'suites' | 'history'>('suites');

  // Use first available project — in production this would come from a URL param or project selector
  const { data: projectsData } = useApiData(() => api.getProjects(), { default: [] as any[] });
  const projectId = (projectsData as any[])?.[0]?.id || '';
  
  const { data: suitesData, loading: suitesLoading, refetch: refetchSuites } = useApiData(() => projectId ? api.getQaHistory({ projectId }) : Promise.resolve([] as any));
  const suites = (suitesData as any)?.data || suitesData || [];

  const { showAlert } = useModal();

  const handleRunSuite = async (suiteId: string) => {
    try {
      await api.runTest({ suiteId });
      showAlert({ title: 'Success', message: 'Test suite triggered successfully!', variant: 'success' });
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to trigger suite', variant: 'error' });
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'page-load': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'form': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'e2e': return <Beaker className="w-5 h-5 text-purple-400" />;
      case 'visual': return <FileSearch className="w-5 h-5 text-green-400" />;
      default: return <Play className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">QA Engine</h1>
              <p className="text-xs text-white/50">Playwright & k6</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('suites')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === 'suites'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Test Suites</span>
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
              <span>Run History</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Suite</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeTab === 'suites' ? 'Test Suites' : 'Run History'}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              Automated end-to-end, visual, and performance verification.
            </p>
          </div>
          {activeTab === 'suites' && (
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors">
                Import Playwright
              </button>
              <button className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Run All</span>
              </button>
            </div>
          )}
        </header>

        <main className="p-8">
          {activeTab === 'suites' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {suitesLoading ? (
                <div className="text-white/50 text-sm">Loading suites...</div>
              ) : suites.length === 0 ? (
                <div className="col-span-full border border-dashed border-white/20 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Beaker className="w-8 h-8 text-white/40" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Test Suites Configured</h3>
                  <p className="text-sm text-white/50 max-w-sm mx-auto mb-6">
                    Create your first automated test suite to ensure platform stability before and after deployments.
                  </p>
                  <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                    Create Test Suite
                  </button>
                </div>
              ) : (
                suites.map((suite: any) => (
                  <div key={suite.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          {getIconForType(suite.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{suite.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-wider">
                            {suite.type}
                          </span>
                        </div>
                      </div>
                      <button className="text-white/40 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Schedule</span>
                        <span className="text-white flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {suite.schedule || 'Manual'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Status</span>
                        <span className="flex items-center text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Passing
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Last Run</span>
                        <span className="text-white/70">
                          {timeAgo(suite.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleRunSuite(suite.id)}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Run Suite</span>
                      </button>
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Placeholder visual regression card shown when no suites exist */}
              {suites.length === 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 opacity-50 pointer-events-none">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <FileSearch className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Visual Regression</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-wider">
                          visual
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm"><span className="text-white/50">Schedule</span><span className="text-white">Daily</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/50">Status</span><span className="text-white">Pending</span></div>
                  </div>
                  <button className="w-full py-2 bg-white/10 text-white rounded-lg text-sm font-medium">Run Suite</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Run ID</th>
                    <th className="px-6 py-4 font-medium">Suite</th>
                    <th className="px-6 py-4 font-medium">Trigger</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {/* Empty state — will be populated from API when test runs are available */}
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/50 text-sm">
                      No test runs yet. Run a suite to see results here.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
