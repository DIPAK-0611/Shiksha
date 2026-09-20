import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import { Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export function Progress() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await apiClient.get('/students');
        setStudents(data);
        if (data.length > 0) {
          // Find Rahul Patil for demo, or just first student
          const defaultStudent = data.find((s:any) => s.name === 'Rahul Patil') || data[0];
          selectStudent(defaultStudent);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const selectStudent = async (student: any) => {
    setSelectedStudent(student);
    try {
      const histData = await apiClient.get(`/students/${student.id}/risk-history`);
      
      // Format data for chart
      const formattedData = histData.map((item: any, index: number) => ({
        name: `Week ${index + 1}`,
        date: new Date(item.recorded_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        risk_score: Math.round(item.risk_score * 100),
        risk_level: item.risk_level
      }));
      setHistory(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.student_code.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-lg text-sm">
          <p className="font-semibold text-slate-800">{payload[0].payload.date}</p>
          <p className="text-slate-600">Risk Score: <span className="font-medium text-slate-900">{payload[0].value}%</span></p>
          <p className="text-slate-600">Level: <span className="font-medium text-slate-900">{payload[0].payload.risk_level}</span></p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Student Selection */}
        <div className="lg:col-span-1 bg-white border border-slate-300 flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-300">
            <h2 className="font-semibold text-slate-900 mb-3">Select Student</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => selectStudent(student)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 transition-colors ${selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div className="text-slate-900">{student.name}</div>
                <div className="text-xs text-slate-500 font-normal">{student.student_code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Area - Chart */}
        <div className="lg:col-span-3 space-y-6">
          {selectedStudent ? (
            <div className="bg-white border border-slate-300 p-5">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Risk Trend: {selectedStudent.name}</h2>
                <p className="text-sm text-slate-600">Historical risk score over the past weeks</p>
              </div>
              
              <div className="h-80 w-full">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={history}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} dy={10} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      
                      <ReferenceLine y={70} stroke="#b91c1c" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'High Risk Threshold', fill: '#b91c1c', fontSize: 12 }} />
                      <ReferenceLine y={40} stroke="#b45309" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Medium Risk Threshold', fill: '#b45309', fontSize: 12 }} />
                      
                      <Line 
                        type="stepAfter" 
                        dataKey="risk_score" 
                        stroke="#1d4ed8" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#1d4ed8', strokeWidth: 1, stroke: '#fff' }}
                        activeDot={{ r: 5, fill: '#1e40af', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No historical data available for this student.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-300 p-12 text-center h-full flex flex-col items-center justify-center">
              <p className="text-slate-500">Select a student to view their progress history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
