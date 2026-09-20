import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';

export function Settings() {
  const { profile: globalProfile, setProfile: setGlobalProfile } = useUser();
  const [profile, setProfile] = useState(globalProfile);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      setGlobalProfile(profile);
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          role: profile.role,
          notifications: profile.notifications
        }
      });
      if (error) throw error;
      setToast('Profile settings saved successfully.');
    } catch (err) {
      console.error(err);
      setToast('Failed to save profile settings.');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl relative">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm z-50 transition-opacity">
          {toast}
        </div>
      )}
      
      <h2 className="text-lg font-medium text-slate-800">Settings</h2>
      
      <div className="bg-white border border-slate-300">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-medium text-slate-800 mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full text-sm border border-slate-300 rounded-none p-2 text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={profile.email} 
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full text-sm border border-slate-300 rounded-none p-2 text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select 
                value={profile.role} 
                onChange={(e) => setProfile({...profile, role: e.target.value})}
                className="w-full text-sm border border-slate-300 rounded-none p-2 text-slate-900 focus:ring-1 focus:ring-blue-600 focus:outline-none" 
              >
                <option value="Mentor / Faculty">Mentor / Faculty</option>
                <option value="Administrator">Administrator</option>
                <option value="Counselor">Counselor</option>
                <option value="Advisor">Advisor</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-700 text-white hover:bg-blue-800 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-medium text-slate-800 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={profile.notifications.emailAlerts}
                onChange={(e) => setProfile({
                  ...profile, 
                  notifications: { ...profile.notifications, emailAlerts: e.target.checked }
                })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3" 
              />
              <span className="text-sm text-slate-700">Email alerts for new high-risk predictions</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={profile.notifications.weeklyDigest}
                onChange={(e) => setProfile({
                  ...profile, 
                  notifications: { ...profile.notifications, weeklyDigest: e.target.checked }
                })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3" 
              />
              <span className="text-sm text-slate-700">Weekly digest of student progress</span>
            </label>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-base font-medium text-slate-800 mb-4">System Information</h3>
          <div className="text-sm text-slate-600 space-y-2">
            <p><span className="font-medium text-slate-700 mr-2">Data Refresh:</span> Nightly (02:00 AM)</p>
            <p><span className="font-medium text-slate-700 mr-2">Prediction Engine:</span> Risk Model v1.0</p>
            <p><span className="font-medium text-slate-700 mr-2">App Version:</span> v1.0.0-beta</p>
          </div>
        </div>
      </div>
    </div>
  );
}
