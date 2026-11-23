import React, { useState } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useDownloads';
import { authAPI } from '../services/api';
import { HardDrive, KeyRound, Check } from 'lucide-react';
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          System Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure default formats, retention durations, and security keys.
        </p>
      </div>

      {/* Ingestion & Retention */}
      <div className="minimal-card p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <HardDrive className="w-4 h-4 text-zinc-500" />
          Download & Storage Policies
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Control concurrency and automated file retention on this VPS node.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Default Video Format
              </label>
              <select
                name="defaultFormat"
                defaultValue={settings.defaultFormat || 'mp4'}
                className="input-field text-xs"
              >
                <option value="mp4">MP4 (Standard)</option>
                <option value="webm">WebM</option>
                <option value="mp3">MP3 (Audio Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Preferred Quality Target
              </label>
              <select
                name="preferredQuality"
                defaultValue={settings.preferredQuality || '720p'}
                className="input-field text-xs"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
                <option value="360p">360p Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Max Concurrent Downloads
              </label>
              <input
                type="number"
                min="1"
                max="5"
                name="maxConcurrentDownloads"
                defaultValue={settings.maxConcurrentDownloads || 3}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                File Retention Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                name="fileRetentionDays"
                defaultValue={settings.fileRetentionDays || 30}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoCleanup"
              name="autoCleanup"
              defaultChecked={settings.autoCleanup !== false}
              className="w-3.5 h-3.5 rounded text-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-0"
            />
            <label htmlFor="autoCleanup" className="text-xs text-zinc-600 dark:text-zinc-400">
              Enable automatic purge of files exceeding retention window
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="btn-primary py-2 px-4 text-xs gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="minimal-card p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-zinc-500" />
          Update Admin Password
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Ensure strong password standards (minimum 8 characters, 1 uppercase, 1 number).
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="input-field text-xs"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input-field text-xs"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading || !newPassword || !currentPassword}
            className="btn-secondary py-2 px-4 text-xs"
          >
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
