import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { MetricBlock } from '@/components/ui/MetricBlock';
import { BookOpen, CheckCircle, TrendingUp, AlertCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackState, setFeedbackState] = useState<{id: number, text: string, status: string} | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [student, metrics, prediction, explanation, interventionsData] = await Promise.all([
          apiClient.get(`/students/${id}`),
          apiClient.get(`/students/${id}/metrics`),
          apiClient.get(`/students/${id}/prediction`),
          apiClient.get(`/students/${id}/explanation`),
          apiClient.get(`/students/${id}/interventions`),
        ]);
        
        setData({ student, metrics, prediction, explanation, ...interventionsData });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAssign = async (interventionId: number) => {
    try {
      const res = await apiClient.post('/interventions', {
        student_id: id,
        intervention_id: interventionId,
        mentor_id: 1 // demo mentor
      });
      // Refresh interventions
      const interventionsData = await apiClient.get(`/students/${id}/interventions`);
      setData((prev: any) => ({ ...prev, ...interventionsData }));
      showToast('Intervention assigned successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedbackState) return;
    try {
      await apiClient.put(`/interventions/${feedbackState.id}`, {
        status: feedbackState.status,
        mentor_feedback: feedbackState.text
      });
      setFeedbackState(null);
      // Refresh interventions
      const interventionsData = await apiClient.get(`/students/${id}/interventions`);
      setData((prev: any) => ({ ...prev, ...interventionsData }));
      showToast('Feedback saved.');
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!data?.student) {
    return <div className="py-12 text-center text-slate-500">Student not found.</div>;
  }

  const { student, metrics, prediction, explanation, assigned, recommended } = data;

  return (
    <div className="space-y-8 relative">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm z-50 transition-opacity">
          {toast}
        </div>
      )}

      {/* Header Profile */}
      <div className="bg-white border-b border-slate-300 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
            <div className="flex flex-wrap items-center text-sm text-slate-600 mt-1 gap-x-4 gap-y-2">
              <span>{student.student_code}</span>
              <span>•</span>
              <span>{student.course} (Semester {student.semester})</span>
              <span>•</span>
              <span>{student.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Risk</div>
              <RiskBadge level={prediction.risk_level || 'UNKNOWN'} className="text-sm px-3 py-1" />
            </div>
            {prediction.risk_probability && (
              <div className="text-right border-l border-slate-300 pl-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Model Probability</div>
                <div className="text-lg font-bold text-slate-900">{Math.round(prediction.risk_probability * 100)}%</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-medium text-slate-800">Current Performance</h2>
          
          <div className="bg-white border border-slate-300 p-0">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-4 text-slate-600 font-medium">Attendance</td>
                  <td className="py-3 px-4 text-slate-900 font-bold text-right">{metrics.attendance_percent}%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600 font-medium">Assignment Completion</td>
                  <td className="py-3 px-4 text-slate-900 font-bold text-right">{metrics.assignment_percent}%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600 font-medium">Internal Marks</td>
                  <td className="py-3 px-4 text-slate-900 font-bold text-right">{metrics.internal_marks}/100</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600 font-medium">Learning Activity</td>
                  <td className="py-3 px-4 text-slate-900 font-bold text-right">{metrics.learning_activity}%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600 font-medium">Quiz Score</td>
                  <td className="py-3 px-4 text-slate-900 font-bold text-right">{metrics.quiz_score}%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-600 font-medium">Missed Assessments</td>
                  <td className="py-3 px-4 text-red-700 font-bold text-right">{metrics.missed_assessments}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Explainability & Interventions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* XAI Section */}
          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-4">Risk Factors</h2>
            <div className="bg-white border border-slate-300 p-5">
              <p className="text-sm text-slate-700 mb-4 pb-3 border-b border-slate-200">
                The following factors are the strongest contributors associated with this student's current risk prediction.
              </p>
              
              <div className="space-y-3">
                {explanation && explanation.length > 0 ? explanation.map((exp: any) => (
                  <div key={exp.id} className="flex items-center text-sm border border-slate-200 p-2 bg-slate-50">
                    <div className="w-1/3 font-semibold text-slate-800 truncate pr-4">{exp.feature_name}</div>
                    <div className="w-2/3 flex items-center">
                      <div className="flex-1 relative h-2 bg-white border border-slate-300 flex items-center justify-center overflow-hidden">
                        <div className="absolute w-px h-full bg-slate-400 z-10"></div>
                        {exp.impact_direction === 'increases risk' ? (
                          <div className="absolute left-1/2 h-full bg-red-500" style={{width: `${exp.impact_value * 100}%`}}></div>
                        ) : (
                          <div className="absolute right-1/2 h-full bg-emerald-500" style={{width: `${exp.impact_value * 100}%`}}></div>
                        )}
                      </div>
                      <span className="ml-3 text-xs font-medium w-24 text-slate-600 shrink-0 uppercase tracking-wide">
                        {exp.impact_direction}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500">No explanation factors available.</div>
                )}
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="flex items-start bg-blue-50/50 p-3 border border-blue-100">
                  <AlertCircle className="h-4 w-4 text-blue-700 mr-2 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Summary: </strong> 
                    Low attendance and weak recent performance are the strongest factors associated with this student's current risk prediction. This prediction is a support signal and not a definitive judgment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Interventions */}
          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-4">Recommended Support</h2>
            <div className="grid grid-cols-1 gap-3">
              {recommended && recommended.length > 0 ? recommended.map((rec: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-300 p-4 flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-slate-900">{rec.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{rec.reason || rec.description}</p>
                  </div>
                  <button 
                    onClick={() => handleAssign(rec.id)}
                    className="mt-3 md:mt-0 whitespace-nowrap flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-sm transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Assign
                  </button>
                </div>
              )) : (
                <div className="bg-white border border-slate-300 p-4 text-sm text-slate-500">
                  No specific interventions recommended at this time.
                </div>
              )}
            </div>
          </section>

          {/* Active / Past Interventions */}
          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-4">Support Actions History</h2>
            <div className="bg-white border border-slate-300">
              {assigned && assigned.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {assigned.map((item: any) => (
                    <li key={item.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">Assigned: {new Date(item.assigned_date).toLocaleDateString()}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border",
                          item.status === 'Completed' ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                          item.status === 'Pending' ? "bg-amber-50 text-amber-800 border-amber-300" :
                          "bg-blue-50 text-blue-800 border-blue-300"
                        )}>
                          {item.status}
                        </span>
                      </div>
                      
                      {item.mentor_feedback && (
                        <div className="mt-3 bg-slate-50 border border-slate-100 p-3 rounded text-sm text-slate-600">
                          <span className="font-medium text-slate-700 mr-2">Feedback:</span>
                          {item.mentor_feedback}
                        </div>
                      )}

                      {item.status !== 'Completed' && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          {feedbackState?.id === item.id ? (
                            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200">
                              <select 
                                className="w-full text-sm border border-slate-300 rounded-none p-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                value={feedbackState.status}
                                onChange={e => setFeedbackState({...feedbackState, status: e.target.value})}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Needs Follow-up">Needs Follow-up</option>
                              </select>
                              <textarea 
                                className="w-full text-sm border border-slate-300 rounded-none p-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                rows={2}
                                placeholder="Enter mentor feedback..."
                                value={feedbackState.text}
                                onChange={e => setFeedbackState({...feedbackState, text: e.target.value})}
                              ></textarea>
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => setFeedbackState(null)}
                                  className="px-3 py-1.5 text-sm text-slate-700 border border-slate-300 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={handleSaveFeedback}
                                  className="px-3 py-1.5 text-sm bg-blue-700 text-white hover:bg-blue-800"
                                >
                                  Save Feedback
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setFeedbackState({ id: item.id, text: item.mentor_feedback || '', status: item.status })}
                              className="text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center"
                            >
                              Record Feedback <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-slate-500">
                  No support actions have been assigned yet.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
