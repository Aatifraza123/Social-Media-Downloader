import React, { useState } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useDownloads';
import { authAPI } from '../services/api';
import { Settings as SettingsIcon, Shield, HardDrive, KeyRound, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { data: settingsData } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const settings = settingsData?.data || {};

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSettingsMutation.mutate({
      defaultFormat: formData.get('defaultFormat'),
      preferredQuality: formData.get('preferredQuality'),
      maxConcurrentDownloads: Number(formData.get('maxConcurrentDownloads')),
      fileRetentionDays: Number(formData.get('fileRetentionDays')),
      autoCleanup: formData.get('autoCleanup') === 'on',
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Admin password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          System Preferences
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure default formats, security keys, and automated storage maintenance.
        </p>
      </div>

      {/* Ingestion & Retention */}
      <div className="glass-card p-6 border-white/10 shadow-xl">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          Download & Storage Policies
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Default Video Format
              </label>
              <select
                name="defaultFormat"
                defaultValue={settings.defaultFormat || 'mp4'}
                className="input-field bg-navy-900 border-white/15"
              >
                <option value="mp4">MP4 (Recommended)</option>
                <option value="webm">WebM</option>
                <option value="mp3">MP3 (Audio Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Preferred Quality Target
              </label>
              <select
                name="preferredQuality"
                defaultValue={settings.preferredQuality || '720p'}
                className="input-field bg-navy-900 border-white/15"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
                <option value="360p">360p Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Max Concurrent Downloads
              </label>
              <input
                type="number"
                min="1"
                max="5"
                name="maxConcurrentDownloads"
                defaultValue={settings.maxConcurrentDownloads || 3}
                className="input-field bg-navy-900 border-white/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                File Retention Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                name="fileRetentionDays"
                defaultValue={settings.fileRetentionDays || 30}
                className="input-field bg-navy-900 border-white/15"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoCleanup"
              name="autoCleanup"
              defaultChecked={settings.autoCleanup !== false}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-navy-900 border-white/20"
            />
            <label htmlFor="autoCleanup" className="text-xs text-gray-300 font-medium">
              Enable automatic cleanup of files older than retention policy
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="glass-card p-6 border-white/10 shadow-xl">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-purple-400" />
          Update Security Credentials
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="input-field bg-navy-900 border-white/15 text-sm"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              New Password (min 8 chars, 1 uppercase, 1 number)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input-field bg-navy-900 border-white/15 text-sm"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading || !newPassword || !currentPassword}
            className="btn-secondary py-2.5 px-6 text-sm text-indigo-300 hover:text-white"
          >
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
