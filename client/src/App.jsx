import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

const Downloader = lazy(() => import('./pages/Downloader'));
const BatchDownloader = lazy(() => import('./pages/BatchDownloader'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/downloader" replace />} />
          <Route path="/downloader" element={<Downloader />} />
          <Route path="/batch" element={<BatchDownloader />} />
        </Route>
        <Route path="*" element={<Navigate to="/downloader" replace />} />
      </Routes>
    </Suspense>
  );
}
