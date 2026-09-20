import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Search, Filter } from 'lucide-react';

export function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiClient.get('/students');
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStudents = students.filter(s => {
    if (riskFilter !== 'ALL' && s.risk_level !== riskFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.student_code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full shadow-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={riskFilter} 
            onChange={e => setRiskFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-300">
        <table className="min-w-full divide-y divide-slate-300">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Student ID</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Course</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Attendance</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Assignments</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Risk Level</th>
              <th scope="col" className="relative px-4 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
              <tr 
                key={student.id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">
                  {student.student_code}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">{student.name}</div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600">
                  {student.course} (Sem {student.semester})
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                  {student.attendance_percent}%
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                  {student.assignment_percent}%
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <RiskBadge level={student.risk_level} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-semibold">
                  <span className="text-blue-700 hover:text-blue-900">View</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No students found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-500">
          Showing <span className="font-medium">{filteredStudents.length}</span> students
        </div>
      </div>
    </div>
  );
}
