import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Phone, 
  MessageCircle, 
  ScanLine,
  Filter,
  Layers,
  Search
} from 'lucide-react';
import type { Product, Agency, OrderInquiry } from '../types/pharmacy';
import { createProduct, updateInquiryStatus } from '../services/api';

interface AgencyInventoryManagerProps {
  products: Product[];
  agencies: Agency[];
  inquiries: OrderInquiry[];
  onProductAdded: () => void;
  onInquiryUpdated: () => void;
  onNavigateToScanner: () => void;
}

export const AgencyInventoryManager: React.FC<AgencyInventoryManagerProps> = ({
  products,
  agencies,
  inquiries,
  onProductAdded,
  onInquiryUpdated,
  onNavigateToScanner,
}) => {
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'inventory' | 'inquiries'>('inventory');
  const [searchFilter, setSearchFilter] = useState('');
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

  // Filtered products for this agency view
  const agencyProducts = products.filter(p => {
    if (selectedAgencyId !== 'All' && p.agencyId !== selectedAgencyId) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.genericName.toLowerCase().includes(q) || p.batchNo.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered inquiries
  const agencyInquiries = inquiries.filter(i => {
    if (selectedAgencyId !== 'All' && i.agencyId !== selectedAgencyId) return false;
    return true;
  });

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const targetAgency = agencies.find(a => a.id === targetAgencyId) || agencies[0];
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
        source: 'manual'
      });

      setShowAddModal(false);
      resetAddForm();
      onProductAdded();
    } catch (err: any) {
      alert('Error adding product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setName('');
    setGenericName('');
    setCompany('');
  };

  const handleUpdateStatus = async (id: string, status: 'Pending' | 'Confirmed' | 'Dispatched') => {
    try {
      await updateInquiryStatus(id, status);
      onInquiryUpdated();
    } catch (err: any) {
      alert('Failed to update inquiry: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Building2 className="w-4 h-4" />
            <span>MR & Agency Stock Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Stockist Inventory & Incoming Store Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your live wholesale catalog, adjust available stock quantities, and confirm purchase inquiries received from retail pharmacies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={onNavigateToScanner}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors min-h-[40px]"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Bill (Bulk Upload)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Product</span>
          </button>
        </div>
      </div>

      {/* Agency Switcher & Mode Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200">
        {/* Sub-tabs: Inventory vs Inquiries */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-2 sm:py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catalog ({agencyProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 py-2 sm:py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'inquiries'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Inquiries</span>
            {agencyInquiries.filter(i => i.status === 'Pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 flex items-center justify-center">
                {agencyInquiries.filter(i => i.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Agency Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium">Viewing Agency / MR:</label>
          <select
            value={selectedAgencyId}
            onChange={(e) => setSelectedAgencyId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-2 text-slate-800 focus:outline-teal-600 w-full sm:w-auto min-h-[38px]"
          >
            <option value="All">All Registered Agencies & MRs</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: Inventory View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter stock by tablet name, salt, or batch..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-teal-600 min-h-[40px]"
            />
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Medicine Brand & Formulation</th>
                    <th className="py-2.5 px-3">Manufacturer</th>
                    <th className="py-2.5 px-2">Batch / Exp</th>
                    <th className="py-2.5 px-3">Stockist / MR</th>
                    <th className="py-2.5 px-2 text-right">PTR (₹)</th>
                    <th className="py-2.5 px-2 text-right">MRP (₹)</th>
                    <th className="py-2.5 px-2 text-right">Stock (Units)</th>
                    <th className="py-2.5 px-3">Scheme</th>
                    <th className="py-2.5 px-2 text-center">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agencyProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <strong className="font-bold text-slate-900">{p.name}</strong>
                        <span className="block text-[11px] text-slate-500 truncate max-w-xs">{p.genericName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{p.company}</td>
                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-600">
                        {p.batchNo}<br />
                        <span className="text-slate-400">Exp: {p.expDate}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{p.agencyName}</span>
                        <span className="block text-[11px] text-slate-500">MR: {p.mrName}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-teal-800 font-mono tabular-nums">
                        ₹{p.ptr.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600 font-mono tabular-nums">
                        ₹{p.mrp.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {p.stockQty}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium text-[11px]">
                        {p.scheme || 'Standard'}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.source === 'bill_scan'
                            ? 'bg-teal-50 text-teal-700 border border-teal-100'
                            : p.source === 'promotion'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.source === 'bill_scan' ? 'Scanned' : p.source === 'promotion' ? 'Launch' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (Visible on mobile screens) */}
          <div className="md:hidden space-y-3">
            {agencyProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="text-[11px] text-slate-500">{p.genericName}</p>
                    <p className="text-[11px] text-slate-600 font-medium">{p.company}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    p.source === 'bill_scan'
                      ? 'bg-teal-50 text-teal-700 border border-teal-100'
                      : p.source === 'promotion'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.source === 'bill_scan' ? 'Scanned' : p.source === 'promotion' ? 'Launch' : 'Manual'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-100 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">PTR</span>
                    <span className="text-xs font-bold text-teal-800 font-mono tabular-nums">₹{p.ptr.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">MRP</span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">₹{p.mrp.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">In Stock</span>
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">{p.stockQty}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">{p.agencyName}</span>
                    <span className="block text-[10px] text-slate-400">MR: {p.mrName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-medium">{p.scheme || 'Standard'}</span>
                    <span className="block font-mono text-[10px] text-slate-400">{p.batchNo} · Exp {p.expDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Incoming Inquiries View */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agencyInquiries.map((inq) => {
              const waLink = `https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello ${inq.pharmacistName} (${inq.medicalStoreName}),\n\nRegarding your stock inquiry on PharmaBridge for *${inq.productName}*, Requested Qty: ${inq.requestedQty} units.\n\nWe confirm the stock is ready for dispatch. Please confirm billing address.`
              )}`;

              return (
                <div
                  key={inq.id}
                  className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {inq.medicalStoreName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Pharmacist: <strong>{inq.pharmacistName}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{inq.city}</span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      inq.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : inq.status === 'Dispatched'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {inq.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-xs space-y-1">
                    <p className="font-semibold text-slate-800">
                      Product: {inq.productName}
                    </p>
                    <p className="text-slate-600">
                      Requested Quantity: <strong className="font-mono text-slate-900">{inq.requestedQty} units</strong>
                    </p>
                    {inq.notes && (
                      <p className="text-slate-500 italic mt-1">&ldquo;{inq.notes}&rdquo;</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <a
                        href={`tel:${inq.phone}`}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {inq.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(inq.id, 'Confirmed')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}
                      {inq.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(inq.id, 'Dispatched')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          Mark Dispatched
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Product Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Quick Add Single Medicine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly list a tablet in the agency warehouse catalog without scanning a bill.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-semibold p-1"
              >
                ✕
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
