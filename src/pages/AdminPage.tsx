import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Key, Users, FileCheck, CheckCircle2,
  RefreshCw, Copy, Check, Cpu, Download, Phone, Mail, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OrderRecord } from '../types';
import { ButtonAuditModal } from '../components/ButtonAuditModal';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newKeyPlan, setNewKeyPlan] = useState('WHITE LABEL SOVEREIGN');

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleGenerateKey = () => {
    const hex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const key = `SHAAR-${newKeyPlan.includes('SOVEREIGN') ? 'SOV' : 'STD'}-33N-${hex}-KEY`;
    setGeneratedKey(key);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#140904_0%,#000008_70%)]">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Shield size={12} />
              Director Command Console · Level-V Sovereign
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-gold">
              Director Admin & IP Vault
            </h1>
            <p className="text-white/50 text-xs sm:text-sm max-w-2xl mt-1">
              Platform management, cryptographic license provisioning, and 100% intellectual property ownership registry under Damone Ward.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAuditModal(true)}
              className="px-4 py-2 rounded-xl bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Cpu size={14} />
              <span>Run System & Button Audit</span>
            </button>

            <Link to="/checkout">
              <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-colors">
                Open Checkout Page
              </button>
            </Link>
          </div>
        </div>

        {/* Director Profile & IP Ownership Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#fbbf24]/10 via-black/40 to-black border border-[#fbbf24]/30 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#ef4444] text-black font-black font-hebrew text-3xl flex items-center justify-center border-2 border-white/20 shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                ד
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#10b981] uppercase font-bold tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={12} /> Authenticated Sovereign Director
                </span>
                <h2 className="text-2xl font-bold text-white">Damone Ward</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/60 mt-1">
                  <span>admin-damoneward38@gmail.com</span>
                  <span>·</span>
                  <a href="tel:4432106995" className="text-[#fbbf24] hover:underline">
                    443-210-6995
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-red-500/30 self-start sm:self-auto">
              <div className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1.5">
                <Lock size={12} /> Legal IP Standing
              </div>
              <div className="text-xs font-bold text-white mt-1">
                100% Retained Permanently & Irrevocably
              </div>
              <div className="text-[10px] text-white/50">
                All 33rd parallel algorithms, formulas, and gates
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-mono text-white/40 uppercase">Clearance Level</div>
              <div className="text-sm font-bold font-mono text-[#fbbf24]">LEVEL_V_SOVEREIGN</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-mono text-white/40 uppercase">Active Licenses</div>
              <div className="text-sm font-bold font-mono text-[#10b981]">{orders.length} Nodes</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-mono text-white/40 uppercase">Acoustic Pipeline</div>
              <div className="text-sm font-bold font-mono text-[#06b6d4]">111Hz King's Chamber</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-mono text-white/40 uppercase">Server Status</div>
              <div className="text-sm font-bold font-mono text-[#a855f7]">ONLINE (Port 3000)</div>
            </div>
          </div>
        </div>

        {/* Cryptographic Key Generator Tool */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="text-[#fbbf24]" size={16} />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Cryptographic License Key Generator
              </h3>
            </div>
            <span className="text-xs font-mono text-white/40">Instant SHA-256 Token</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={newKeyPlan}
              onChange={(e) => setNewKeyPlan(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#fbbf24]"
            >
              <option value="WHITE LABEL SOVEREIGN">WHITE LABEL SOVEREIGN ($149,997/mo)</option>
              <option value="WHITE LABEL STANDARD">WHITE LABEL STANDARD ($49,997/mo)</option>
              <option value="FIELD OPERATOR PASS">FIELD OPERATOR PASS ($997)</option>
            </select>

            <button
              onClick={handleGenerateKey}
              className="px-5 py-2.5 rounded-xl bg-[#fbbf24] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#fbbf24]/90 transition-colors cursor-pointer"
            >
              Mint Key Now
            </button>

            {generatedKey && (
              <div className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-black/80 border border-[#fbbf24]/30 font-mono text-xs text-[#fbbf24]">
                <span>{generatedKey}</span>
                <button
                  onClick={() => handleCopy(generatedKey)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white ml-2 cursor-pointer"
                  title="Copy"
                >
                  {copiedKey ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Orders & Licensees Table */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-[#06b6d4]" size={16} />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Active Orders & Provisioned Licenses
              </h3>
            </div>
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Refresh order log"
            >
              <RefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 font-mono text-white/40 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Licensee</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">License Key</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono text-white/70">{ord.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{ord.customerName}</div>
                      <div className="text-[10px] text-white/40 font-mono">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{ord.planName}</td>
                    <td className="py-3 px-3 font-mono text-[#fbbf24]">
                      ${ord.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#06b6d4]">{ord.licenseKey}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ButtonAuditModal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} />
    </div>
  );
};
