import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { MetricBlock } from '@/components/ui/MetricBlock';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { apiClient } from '@/api/client';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [sumData, studentData] = await Promise.all([
          apiClient.get('/dashboard/summary'),
          apiClient.get('/students')
        ]);
        setSummary(sumData);
        setStudents(studentData);
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

  if (!summary) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded relative text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <strong className="font-bold block text-lg mb-2">Unable to connect to Backend Server</strong>
        <span className="block sm:inline">The backend API is currently unreachable. Please make sure your backend server is deployed and the VITE_API_URL environment variable is set correctly.</span>
      </div>
    );
  }

  const needsAttention = students.filter(s => s.risk_level === 'HIGH' || s.risk_level === 'MEDIUM').slice(0, 10);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-slate-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricBlock 
            title="Total Students" 
            value={summary.totalStudents} 
            icon={Users}
          />
          <MetricBlock 
            title="High Risk" 
            value={summary.highRisk} 
            icon={AlertTriangle}
            className="border-red-200 bg-red-50/30"
          />
          <MetricBlock 
            title="Medium Risk" 
            value={summary.mediumRisk} 
          />
          <MetricBlock 
            title="Active Interventions" 
            value={summary.activeInterventions} 
            icon={Clock}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-800">Students Requiring Attention</h2>
          <button 
            onClick={() => navigate('/students')}
            className="text-sm text-blue-600 font-medium hover:text-blue-800"
          >
            View all students &rarr;
          </button>
        </div>
        
        <div className="bg-white border border-slate-300">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Attendance</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Risk Level</th>
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {needsAttention.length > 0 ? needsAttention.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.student_code}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                    {student.course} (Sem {student.semester})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{student.attendance_percent}%</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge level={student.risk_level} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No students currently require attention.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
