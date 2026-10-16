import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Shield, CheckCircle2, Lock, Sparkles,
  ArrowRight, Download, Copy, Check, Printer, FileText,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { WHITE_LABEL_TIERS } from '../data/constants';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OrderRecord } from '../types';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const planParam = searchParams.get('plan') || 'white-label-standard';

  // Find or default plan
  const selectedTier =
    WHITE_LABEL_TIERS.find((t) => t.id === planParam) || WHITE_LABEL_TIERS[1];

  const [activePlanId, setActivePlanId] = useState(selectedTier.id);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Add-ons
  const [addons, setAddons] = useState<{ [key: string]: boolean }>({
    satelliteTelemetry: false,
    bioRemedyPack: false,
    directorBriefing: false,
  });

  // Billing info
  const [customerName, setCustomerName] = useState(user?.name || 'Damone Ward');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'admin-damoneward38@gmail.com');
  const [organization, setOrganization] = useState(
    user?.role === 'director_admin' ? 'Damone Ward Sovereign Holdings' : 'Research Directorate'
  );
  const [phone, setPhone] = useState(user?.phone || '443-210-6995');
  const [country, setCountry] = useState('United States');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire' | 'crypto' | 'po'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('313');

  // Terms agreement
  const [agreedIpTerms, setAgreedIpTerms] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update when tier param changes
  useEffect(() => {
    if (planParam) {
      setActivePlanId(planParam);
    }
  }, [planParam]);

  const currentTier =
    WHITE_LABEL_TIERS.find((t) => t.id === activePlanId) || WHITE_LABEL_TIERS[1];

  // Pricing calculations
  const basePrice = currentTier.price;
  const satellitePrice = addons.satelliteTelemetry ? 2500 : 0;
  const bioPackPrice = addons.bioRemedyPack ? 497 : 0;
  const briefingPrice = addons.directorBriefing ? 5000 : 0;

  const subtotal = basePrice + satellitePrice + bioPackPrice + briefingPrice;
  const discount = billingCycle === 'annual' ? subtotal * 0.15 : 0;
  const totalAmount = Math.max(0, subtotal - discount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedIpTerms) {
      setErrorMsg('You must agree to the Damone Ward 100% IP ownership terms.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.checkout({
        customerName,
        customerEmail,
        organization,
        phone,
        planId: currentTier.id,
        planName: currentTier.name,
        amount: totalAmount,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit Card (Visa/Mastercard)'
            : paymentMethod === 'wire'
            ? 'Federal Reserve Wire (RTGS)'
            : paymentMethod === 'crypto'
            ? 'USDC Sovereign Escrow'
            : 'Corporate Purchase Order',
        billingAddress: { country },
      });

      if (res.success && res.order) {
        setOrderSuccess(res.order);
      } else {
        setErrorMsg('Order processing could not be completed.');
      }
    } catch (err) {
      setErrorMsg('Network error while creating license.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#100720_0%,#000008_70%)]">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Sparkles size={12} />
              Instant Cryptographic License Provisioning
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-gold">
              Platform Checkout & Deployment
            </h1>
            <p className="text-white/50 text-xs sm:text-sm max-w-xl mt-1">
              Secure provisioning for SHA'AR platform access. Instant deployment of cryptographic license keys and access credentials.
            </p>
          </div>

          <div className="text-xs font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            SSL 256-Bit Encrypted Sovereign Gateway
          </div>
        </div>

        {orderSuccess ? (
          /* Confirmation & License Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-[#090b1c] border border-[#10b981]/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-6"
          >
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#10b981] uppercase font-bold tracking-wider">
                  Payment Confirmed · License Activated
                </span>
                <h2 className="text-2xl font-bold text-white">
                  Order Complete: {orderSuccess.id}
                </h2>
                <p className="text-xs font-mono text-white/50">
                  Customer: {orderSuccess.customerName} ({orderSuccess.customerEmail})
                </p>
              </div>
            </div>

            {/* License Key Box */}
            <div className="p-5 rounded-2xl bg-black/60 border border-[#fbbf24]/30 space-y-2">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Cryptographic License Key
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-lg sm:text-xl font-mono font-bold text-[#fbbf24] tracking-wider select-all">
                  {orderSuccess.licenseKey}
                </span>
                <button
                  onClick={() => handleCopyKey(orderSuccess.licenseKey)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-2 border border-white/20 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {copiedKey ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Key Copied' : 'Copy License Key'}</span>
                </button>
              </div>
            </div>

            {/* Order Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[9px] font-mono text-white/40 uppercase">License Plan</div>
                <div className="text-sm font-bold text-white">{orderSuccess.planName}</div>
                <div className="text-xs font-mono text-[#06b6d4]">${orderSuccess.amount.toLocaleString()} USD</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[9px] font-mono text-white/40 uppercase">Payment Method</div>
                <div className="text-sm font-bold text-white">{orderSuccess.paymentMethod}</div>
                <div className="text-xs font-mono text-[#10b981]">Status: {orderSuccess.status}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[9px] font-mono text-white/40 uppercase">Intellectual Property</div>
                <div className="text-xs font-bold text-white">Damone Ward</div>
                <div className="text-[10px] font-mono text-[#fbbf24]">100% Retained Permanently</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="text-xs font-mono text-white/50">
                Receipt and activation token recorded on the sovereign database.
              </div>
              <div className="flex items-center gap-3">
                <Link to="/admin">
                  <button className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/20 transition-colors">
                    View in Director Admin Console
                  </button>
                </Link>
                <Link to="/">
                  <button className="px-5 py-2.5 rounded-xl bg-[#fbbf24] text-black font-bold font-mono text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform">
                    Return To Operations Gate →
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Plan & Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Selector */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    01. Select License Tier
                  </h2>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono ${
                        billingCycle === 'monthly' ? 'bg-[#fbbf24] text-black font-bold' : 'text-white/50'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono ${
                        billingCycle === 'annual' ? 'bg-[#fbbf24] text-black font-bold' : 'text-white/50'
                      }`}
                    >
                      Annual (15% Off)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {WHITE_LABEL_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setActivePlanId(tier.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        activePlanId === tier.id
                          ? 'bg-white/10 border-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                          : 'bg-black/30 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="font-hebrew text-xs mb-1" style={{ color: tier.color }}>
                        {tier.hebrew}
                      </div>
                      <div className="text-xs font-bold text-white">{tier.name}</div>
                      <div className="text-base font-mono font-bold text-[#fbbf24] mt-1">
                        ${tier.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-On Options */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  02. Platform Enhancements & Add-Ons
                </h2>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.satelliteTelemetry}
                      onChange={(e) =>
                        setAddons({ ...addons, satelliteTelemetry: e.target.checked })
                      }
                      className="mt-1 accent-[#fbbf24]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>24/7 Satellite Telemetry Relay</span>
                        <span className="font-mono text-[#fbbf24]">+$2,500</span>
                      </div>
                      <p className="text-[11px] text-white/50">
                        Direct synthetic aperture radar stream along 33.4°N axis.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.bioRemedyPack}
                      onChange={(e) =>
                        setAddons({ ...addons, bioRemedyPack: e.target.checked })
                      }
                      className="mt-1 accent-[#fbbf24]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>Physical Ancient Prep Bio-Pack</span>
                        <span className="font-mono text-[#fbbf24]">+$497</span>
                      </div>
                      <p className="text-[11px] text-white/50">
                        Cold-pressed fish bile, Royal Hojari Frankincense, Nigella Sativa delivered by air courier.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.directorBriefing}
                      onChange={(e) =>
                        setAddons({ ...addons, directorBriefing: e.target.checked })
                      }
                      className="mt-1 accent-[#fbbf24]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>Private Briefing with Damone Ward</span>
                        <span className="font-mono text-[#fbbf24]">+$5,000</span>
                      </div>
                      <p className="text-[11px] text-white/50">
                        Confidential 2-hour strategic briefing with Director Damone Ward under strict NDA.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Customer Clearance & Details */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  03. Licensee Credentials & Organization
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Clearance Email (Login Account)
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Organization / Agency
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Direct Secure Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#fbbf24]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  04. Settlement Method
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'card', label: 'Credit Card', sub: 'Instant' },
                    { id: 'wire', label: 'Federal Wire', sub: 'RTGS / Fedwire' },
                    { id: 'crypto', label: 'USDC Escrow', sub: 'Zero-Gas' },
                    { id: 'po', label: 'Agency PO', sub: 'Net-30' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]'
                          : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[9px] font-mono text-white/40">{m.sub}</div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#fbbf24]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                          Expiration MM/YY
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#fbbf24]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                          Security CVC / CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#fbbf24]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'wire' && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white/70 space-y-1 font-mono">
                    <div className="text-[#fbbf24] font-bold">Federal Reserve Wire Routing (RTGS):</div>
                    <div>Bank: Sovereign Geodetic Reserve Bank</div>
                    <div>Routing: 051000033 · Account: SHAAR-33-DAMONE-WARD</div>
                    <div className="text-white/40 text-[10px]">Reference: SHAAR-INV-33-AUTOGEN</div>
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white/70 space-y-1 font-mono">
                    <div className="text-[#06b6d4] font-bold">USDC Escrow Contract Address:</div>
                    <div className="break-all text-[11px] text-white">0x33446995DamoneWardSovereignSHAAR783Hz963</div>
                    <div className="text-white/40 text-[10px]">Settles instantly on-chain upon broadcast.</div>
                  </div>
                )}

                {paymentMethod === 'po' && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white/70 space-y-1">
                    <div className="text-[#10b981] font-bold">Institutional Purchase Order (Net-30)</div>
                    <p className="text-[11px] text-white/50">
                      Immediate temporary license key generated. Invoice sent to {customerEmail}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Settlement Button */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#080718] border border-[#fbbf24]/30 space-y-6 sticky top-24 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Order Summary
                  </h3>
                  <span className="text-[10px] font-mono text-[#fbbf24]">SHA'AR v8.0</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-white/80">
                    <span>{currentTier.name} ({billingCycle})</span>
                    <span className="font-mono text-white font-bold">${basePrice.toLocaleString()}</span>
                  </div>

                  {addons.satelliteTelemetry && (
                    <div className="flex justify-between items-center text-white/70">
                      <span>Satellite Telemetry Relay</span>
                      <span className="font-mono text-[#fbbf24]">+$2,500</span>
                    </div>
                  )}

                  {addons.bioRemedyPack && (
                    <div className="flex justify-between items-center text-white/70">
                      <span>Ancient Prep Bio-Pack</span>
                      <span className="font-mono text-[#fbbf24]">+$497</span>
                    </div>
                  )}

                  {addons.directorBriefing && (
                    <div className="flex justify-between items-center text-white/70">
                      <span>Private Briefing w/ Damone Ward</span>
                      <span className="font-mono text-[#fbbf24]">+$5,000</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[#10b981]">
                      <span>Annual Discount (15%)</span>
                      <span className="font-mono">-${discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white uppercase">Total Due Today</span>
                    <span className="text-2xl font-bold font-mono text-[#fbbf24] text-glow-gold">
                      ${totalAmount.toLocaleString()} <span className="text-xs text-white/40">USD</span>
                    </span>
                  </div>
                </div>

                {/* IP Ownership Checkbox (Mandatory) */}
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreedIpTerms}
                      onChange={(e) => setAgreedIpTerms(e.target.checked)}
                      className="mt-1 accent-red-500"
                    />
                    <span className="text-[11px] text-white/70 leading-tight">
                      I agree and confirm that <strong>Damone Ward</strong> retains 100% intellectual property ownership of all SHA'AR code, frequencies, formulas, and databases permanently.
                    </span>
                  </label>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Provisioning License...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Checkout & Generate License</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="text-[10px] font-mono text-center text-white/40">
                  Direct Director Line: 443-210-6995 · Instant Receipt
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
