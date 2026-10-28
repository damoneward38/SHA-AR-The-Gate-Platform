/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Pages
import { OperationsPage } from './pages/OperationsPage';
import { GateMapPage } from './pages/GateMapPage';
import { PrepLabPage } from './pages/PrepLabPage';
import { FrequenciesPage } from './pages/FrequenciesPage';
import { FieldOpsPage } from './pages/FieldOpsPage';
import { BuyersPage } from './pages/BuyersPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { CommandCenterPage } from './pages/CommandCenterPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen w-screen flex flex-col font-sans selection:bg-[#fbbf24]/30 overflow-hidden bg-[#000008] text-slate-200">
          <Navbar />
          <div className="flex flex-1 overflow-hidden relative">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <Routes>
                <Route path="/" element={<OperationsPage />} />
                <Route path="/command-center" element={<CommandCenterPage />} />
                <Route path="/map" element={<GateMapPage />} />
                <Route path="/prep" element={<PrepLabPage />} />
                <Route path="/frequencies" element={<FrequenciesPage />} />
                <Route path="/operations" element={<FieldOpsPage />} />
                <Route path="/buyers" element={<BuyersPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminPage />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
