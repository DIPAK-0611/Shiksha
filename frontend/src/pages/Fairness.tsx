import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import { ShieldCheck, Info } from 'lucide-react';

export function Fairness() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await apiClient.get('/fairness');
        setData(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded relative text-center">
        <strong className="font-bold block text-lg mb-2">Unable to connect to Backend Server</strong>
        <span className="block sm:inline">The backend API is currently unreachable. Please make sure your backend server is deployed and the VITE_API_URL environment variable is set correctly.</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Responsible AI & Fairness</h1>
          <p className="text-sm text-slate-500">Monitoring model behavior across student groups</p>
        </div>
      </div>

      <div className="bg-slate-100 border border-slate-300 p-4 flex items-start">
        <Info className="h-5 w-5 text-slate-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-800 space-y-2">
          <p><strong>Important Context</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The risk prediction is a support signal intended to guide mentor attention.</li>
            <li>It should not be used as a final or automated decision about a student's academic standing.</li>
            <li>Correlation between metrics and risk should not automatically be treated as causation.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-300 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Features used for prediction</h2>
          <div className="flex flex-wrap gap-2">
            {data.featuresUsed.map((f: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-300 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Sensitive attributes excluded</h2>
          <div className="flex flex-wrap gap-2">
            {data.sensitiveExcluded.map((f: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 line-through text-xs font-medium border border-slate-200">
                {f}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Note: Exclusion of attributes alone does not guarantee fairness due to proxy variables.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-300 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Model Performance Monitoring</h2>
        <p className="text-sm text-slate-600 mb-4">{data.message}</p>
        
        <div className="overflow-x-auto border border-slate-200">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Demographic Group</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Recall (True Positive Rate)</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">False Negative Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.entries(data.metrics).map(([group, metrics]: [string, any]) => (
                <tr key={group}>
                  <td className="px-4 py-2 text-sm font-medium text-slate-800">{group}</td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <span className="w-12 font-medium">{Math.round(metrics.recall * 100)}%</span>
                      <div className="w-24 h-1.5 bg-slate-200 ml-2">
                        <div className="h-full bg-slate-600" style={{width: `${metrics.recall * 100}%`}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <span className="w-12 font-medium">{Math.round(metrics.false_negative_rate * 100)}%</span>
                      <div className="w-24 h-1.5 bg-slate-200 ml-2">
                        <div className="h-full bg-slate-400" style={{width: `${metrics.false_negative_rate * 100}%`}}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
