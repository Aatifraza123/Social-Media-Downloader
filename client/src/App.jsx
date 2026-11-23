import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

const Downloader = lazy(() => import('./pages/Downloader'));
const BatchDownloader = lazy(() => import('./pages/BatchDownloader'));
const History = lazy(() => import('./pages/History'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Consumer Layout: Anyone can access the downloader immediately without logging in */}
        <Route element={<Layout />}>
          <Route path="/" element={<Downloader />} />
          <Route path="/downloader" element={<Downloader />} />
          <Route path="/batch" element={<BatchDownloader />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
