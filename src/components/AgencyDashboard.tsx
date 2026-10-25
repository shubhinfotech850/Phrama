import React, { useMemo, useState } from 'react';
import {
  Package,
  Clock,
  Boxes,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ScanLine,
  Plus,
  ArrowRight,
  CheckCircle2,
  Truck,
  Building2,
  Sparkles,
  X,
} from 'lucide-react';
import type { Product, Agency, OrderInquiry } from '../types/pharmacy';
import { createProduct } from '../services/api';

interface AgencyDashboardProps {
  products: Product[];
  inquiries: OrderInquiry[];
  agencies: Agency[];
  onNavigateInquiries: () => void;
  onNavigateInventory: () => void;
  onNavigateScanner: () => void;
  onAddProduct: () => void;
  onProductAdded?: () => void;
}

interface StatCard {
  label: string;
  value: string | number;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  bg: string;
  border: string;
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({
  products,
  inquiries,
  agencies,
  onNavigateInquiries,
  onNavigateInventory,
  onNavigateScanner,
  onAddProduct,
  onProductAdded,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Add Form State
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [packSize, setPackSize] = useState('1 x 10 Tablets (Strip)');
  const [batchNo, setBatchNo] = useState(`BT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [mfgDate, setMfgDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDate, setExpDate] = useState('2028-12-31');
  const [mrp, setMrp] = useState<number>(150);
  const [ptr, setPtr] = useState<number>(105);
  const [stockQty, setStockQty] = useState<number>(200);
  const [scheme, setScheme] = useState('10 + 1 Free Scheme');
  const [targetAgencyId, setTargetAgencyId] = useState(agencies[0]?.id || 'ag-1');

  const resetAddForm = () => {
    setName('');
    setGenericName('');
    setCompany('');
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const targetAgency = agencies.find((a) => a.id === targetAgencyId) || agencies[0];
      const margin = mrp > ptr ? Math.round(((mrp - ptr) / mrp) * 100 * 10) / 10 : 30;

      await createProduct({
        name: name.trim(),
        genericName: genericName.trim() || name.trim(),
        category,
        dosageForm,
        packSize,
        batchNo,
        mfgDate,
        expDate,
        mrp: Number(mrp) || 1,
        ptr: Number(ptr) || 1,
        marginPercent: margin,
        stockQty: Number(stockQty) || 10,
        minOrderQty: 10,
        agencyId: targetAgency.id,
        agencyName: targetAgency.name,
        agencyCity: targetAgency.city,
        agencyAddress: `${targetAgency.city} Stockist Depot`,
        mrName: targetAgency.contactPerson,
        mrPhone: targetAgency.phone,
        company: company.trim() || 'Verified Pharma',
        scheme: scheme.trim(),
        isNewRelease: false,
        verified: true,
        source: 'manual',
      });

      setShowAddModal(false);
      resetAddForm();
      onProductAdded?.();
    } catch (err: any) {
      alert('Error adding product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => setShowAddModal(true);

  const pendingCount = inquiries.filter((i) => i.status === 'Pending').length;
  const confirmedCount = inquiries.filter((i) => i.status === 'Confirmed').length;
  const dispatchedCount = inquiries.filter((i) => i.status === 'Dispatched').length;

  const totalStockUnits = useMemo(
    () => products.reduce((sum, p) => sum + p.stockQty, 0),
    [products]
  );

  const lowStockItems = useMemo(
    () => products.filter((p) => p.stockQty > 0 && p.stockQty <= 20).sort((a, b) => a.stockQty - b.stockQty).slice(0, 5),
    [products]
  );

  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stockQty <= 0).length,
    [products]
  );

  const catalogValue = useMemo(
    () => products.reduce((sum, p) => sum + p.ptr * p.stockQty, 0),
    [products]
  );

  const recentInquiries = useMemo(
    () => [...inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    [inquiries]
  );

  const recentStockEntries = useMemo(
    () => [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4),
    [products]
  );

  const stats: StatCard[] = [
    {
      label: 'Total Stock Units',
      value: totalStockUnits.toLocaleString('en-IN'),
      sublabel: `${products.length} unique SKUs listed`,
      icon: Boxes,
      accent: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      label: 'Catalog Value (PTR)',
      value: `₹${catalogValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      sublabel: 'Estimated wholesale value',
      icon: IndianRupee,
      accent: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Pending Inquiries',
      value: pendingCount,
      sublabel: `${confirmedCount} confirmed · ${dispatchedCount} dispatched`,
      icon: Clock,
      accent: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Active Agencies & MRs',
      value: agencies.length,
      sublabel: `${outOfStockCount} items out of stock`,
      icon: Building2,
      accent: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
    },
  ];

  const quickActions = [
    {
      label: 'Scan Distributor Bill',
      description: 'Bulk upload invoice via Gemini OCR',
      icon: ScanLine,
      onClick: onNavigateScanner,
      accent: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      label: 'Add Single Product',
      description: 'Manually list a medicine in catalog',
      icon: Plus,
      onClick: openAddModal,
      accent: 'bg-slate-900 hover:bg-slate-800',
    },
    {
      label: 'Review Inquiries',
      description: `${pendingCount} pending store orders`,
      icon: Clock,
      onClick: onNavigateInquiries,
      accent: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      label: 'View Full Catalog',
      description: `${products.length} items in inventory`,
      icon: Package,
      onClick: onNavigateInventory,
      accent: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-100 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Agency & MR Control Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back to your Stock Dashboard
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-lg">
              Monitor inventory health, track incoming pharmacy orders, and act on low-stock alerts — all in one view.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 text-right">
            <span className="text-3xl font-bold tabular-nums">{products.length}</span>
            <span className="text-[11px] text-teal-100 font-medium uppercase tracking-wider">Active SKUs</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border ${stat.border} p-4 shadow-2xs flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                  {stat.label}
                </span>
                <span className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${stat.accent}`} />
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums leading-none">
                {stat.value}
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-tight">
                {stat.sublabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isLight = action.accent.includes('text-slate-900');
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`group flex items-center gap-3 p-3.5 rounded-xl text-left transition-all shadow-2xs ${action.accent} ${
                  isLight ? 'border border-slate-200' : 'text-white'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    isLight ? 'bg-white' : 'bg-white/15'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold leading-tight truncate">{action.label}</span>
                  <span
                    className={`text-[11px] font-medium leading-tight mt-0.5 truncate ${
                      isLight ? 'text-slate-500' : 'text-white/80'
                    }`}
                  >
                    {action.description}
                  </span>
                </span>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    isLight ? 'text-slate-400' : 'text-white/70'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-column: Low Stock Alerts + Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Stock Alerts
            </h3>
            <button
              type="button"
              onClick={onNavigateInventory}
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.company} · {item.agencyName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-sm font-bold text-amber-700 font-mono tabular-nums leading-none">
                      {item.stockQty}
                    </span>
                    <span className="text-[10px] text-amber-600 font-medium">units left</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">All stock levels are healthy</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No items below the 20-unit threshold</p>
              </div>
            )}
            {outOfStockCount > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">
                  <strong className="text-rose-700">{outOfStockCount}</strong> items completely out of stock
                </span>
                <button
                  type="button"
                  onClick={onNavigateInventory}
                  className="font-semibold text-rose-700 hover:text-rose-900"
                >
                  Restock →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recent Store Inquiries
            </h3>
            <button
              type="button"
              onClick={onNavigateInquiries}
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{inq.productName}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {inq.medicalStoreName} · {inq.city} · Qty {inq.requestedQty}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      inq.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : inq.status === 'Dispatched'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {inq.status === 'Dispatched' && <Truck className="w-2.5 h-2.5 inline mr-0.5" />}
                    {inq.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No inquiries yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Store purchase orders will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Catalog Entries */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            Recently Added Stock
          </h3>
          <button
            type="button"
            onClick={onNavigateInventory}
            className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
          >
            Full catalog <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recentStockEntries.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {p.company} · {p.source === 'bill_scan' ? 'Scanned' : p.source === 'promotion' ? 'Launch' : 'Manual'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-xs font-bold text-teal-700 font-mono tabular-nums leading-none">
                  ₹{p.ptr.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">{p.stockQty} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Product Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Quick Add Single Medicine</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly list a tablet in the agency warehouse catalog without scanning a bill.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tablet Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dolo 650"
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Brand *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Micro Labs Ltd."
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Generic Salt Composition *</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Paracetamol (650mg)"
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md"
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic & Antipyretic">Analgesic & Antipyretic</option>
                    <option value="Antacid / PPI">Antacid / PPI</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antiallergic & Respiratory">Antiallergic & Respiratory</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    placeholder="YYYY-MM"
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PTR (₹) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={ptr}
                    onChange={(e) => setPtr(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheme / Offer</label>
                  <input
                    type="text"
                    value={scheme}
                    onChange={(e) => setScheme(e.target.value)}
                    placeholder="e.g. 10 + 1 Free"
                    className="w-full p-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Agency / MR</label>
                  <select
                    value={targetAgencyId}
                    onChange={(e) => setTargetAgencyId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md"
                  >
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
