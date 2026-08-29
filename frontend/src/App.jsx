import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewScreening from './pages/NewScreening';
import ScreeningDetails from './pages/ScreeningDetails';
import Questions from './pages/Questions';
import Report from './pages/Report';
import IdentityProfile from './pages/IdentityProfile';
import IdentityList from './pages/IdentityList';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/screening/new" element={<NewScreening />} />
        <Route path="/screening/:id" element={<ScreeningDetails />} />
        <Route path="/screening/:id/questions" element={<Questions />} />
        <Route path="/screening/:id/report" element={<Report />} />
        <Route path="/identities" element={<IdentityList />} />
        <Route path="/identity/:id" element={<IdentityProfile />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
