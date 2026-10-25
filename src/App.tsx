import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MedicalStoreView } from './components/MedicalStoreView';
import { BillScanner } from './components/BillScanner';
import { NewReleasePromotions } from './components/NewReleasePromotions';
import { AgencyInventoryManager } from './components/AgencyInventoryManager';
import { AgencyDirectory } from './components/AgencyDirectory';
import { InquiryModal } from './components/InquiryModal';
import type { Product, Promotion, Agency, OrderInquiry, UserRole } from './types/pharmacy';
import { fetchProducts, fetchPromotions, fetchAgencies, fetchInquiries, fetchStats } from './services/api';
import { Pill, Sparkles, ScanLine, Store, Building2, Package, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'medical_search' | 'bill_scanner' | 'new_releases' | 'agency_portal' | 'directory'>('medical_search');
  const [userRole, setUserRole] = useState<UserRole>('medical_store');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [inquiries, setInquiries] = useState<OrderInquiry[]>([]);
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalPromotions: number;
    totalAgencies: number;
    totalMRs: number;
    totalInquiries: number;
    totalStockUnits: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inquiry modal state
  const [activeInquiryProduct, setActiveInquiryProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, promos, ags, inqs, st] = await Promise.all([
        fetchProducts(),
        fetchPromotions(),
        fetchAgencies(),
        fetchInquiries(),
        fetchStats().catch(() => null),
      ]);
      setProducts(prods);
      setPromotions(promos);
      setAgencies(ags);
      setInquiries(inqs);
      setStats(st);
    } catch (err: any) {
      console.error('Failed to load pharmacy data:', err);
      setError(err.message || 'Unable to connect to database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'mr_agency' && activeTab === 'medical_search') {
      setActiveTab('bill_scanner');
    } else if (role === 'medical_store' && (activeTab === 'bill_scanner' || activeTab === 'agency_portal')) {
      setActiveTab('medical_search');
    }
  };

  const handleOpenSampleInquiry = (productName: string, agencyName: string, mrPhone: string) => {
    // Find or craft product proxy
    const found = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (found) {
      setActiveInquiryProduct(found);
    } else {
      setActiveInquiryProduct({
        id: `promo-order-${Date.now()}`,
        name: productName,
        genericName: 'Sample Request',
        category: 'Doctor Samples',
        dosageForm: 'Tablet',
        packSize: 'Doctor Sample Kit',
        batchNo: 'TRIAL-01',
        mfgDate: new Date().toISOString().split('T')[0],
        expDate: '2028-01',
        mrp: 0,
        ptr: 0,
        stockQty: 50,
        minOrderQty: 1,
        agencyId: 'promo',
        agencyName,
        agencyCity: 'Regional Hub',
        mrName: agencyName,
        mrPhone,
        company: 'Pharma Sponsor',
        verified: true,
        updatedAt: new Date().toISOString(),
        source: 'promotion'
      });
    }
  };

  const pendingInquiriesCount = inquiries.filter(i => i.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Primary Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={handleRoleChange}
        pendingInquiriesCount={pendingInquiriesCount}
      />

      {/* Hero Role Bar & Live Metric Strip (Responsive for all screens) */}
      <section className="bg-white border-b border-slate-200 py-2.5 sm:py-3 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-slate-500 text-[11px] sm:text-xs">Workspace:</span>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] sm:text-xs ${
              userRole === 'medical_store' 
                ? 'bg-slate-900 text-white' 
                : 'bg-teal-700 text-white'
            }`}>
              <span className="hidden sm:inline">
                {userRole === 'medical_store' ? 'Retail Pharmacy / Medical Store Portal' : 'Medical Representative (MR) & Agency Hub'}
              </span>
              <span className="sm:hidden">
                {userRole === 'medical_store' ? 'Chemist / Store' : 'MR & Agency'}
              </span>
            </span>
            <span className="hidden md:inline text-slate-300">·</span>
            <span className="hidden md:inline text-slate-500 text-[11px]">
              {userRole === 'medical_store' 
                ? 'Search tablet stock, check PTR rates & schemes' 
                : 'Scan invoices to auto-update DB, manage store POs'}
            </span>
          </div>

          {stats && (
            <div className="flex items-center gap-2.5 sm:gap-4 text-slate-600 font-mono text-[10px] sm:text-[11px] tabular-nums overflow-x-auto scrollbar-none pb-0.5">
              <span className="whitespace-nowrap"><strong>{stats.totalProducts}</strong> Meds in DB</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="whitespace-nowrap"><strong>{stats.totalAgencies + stats.totalMRs}</strong> Stockists & MRs</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="whitespace-nowrap"><strong>{stats.totalPromotions}</strong> New Launches</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="whitespace-nowrap"><strong>{stats.totalInquiries}</strong> POs</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Viewport with mobile bottom bar clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-800">Connecting to Pharmacy Database...</p>
            <p className="text-xs text-slate-500 mt-1">Loading tablet listings, distributor inventories, and MR launch campaigns</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-center space-y-3">
            <p className="text-sm font-bold text-rose-900">Database Connection Error</p>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'medical_search' && (
              <MedicalStoreView
                products={products}
                agencies={agencies}
                onOpenInquiry={(p) => setActiveInquiryProduct(p)}
                onSelectNewReleasesTab={() => setActiveTab('new_releases')}
              />
            )}

            {activeTab === 'bill_scanner' && (
              <BillScanner
                agencies={agencies}
                onUploadSuccess={loadData}
                onNavigateToStock={() => setActiveTab('agency_portal')}
              />
            )}

            {activeTab === 'new_releases' && (
              <NewReleasePromotions
                promotions={promotions}
                agencies={agencies}
                onPromotionCreated={loadData}
                onOpenSampleInquiry={handleOpenSampleInquiry}
              />
            )}

            {activeTab === 'agency_portal' && (
              <AgencyInventoryManager
                products={products}
                agencies={agencies}
                inquiries={inquiries}
                onProductAdded={loadData}
                onInquiryUpdated={loadData}
                onNavigateToScanner={() => setActiveTab('bill_scanner')}
              />
            )}

            {activeTab === 'directory' && (
              <AgencyDirectory
                agencies={agencies}
                onSelectAgencyProducts={(agencyId) => {
                  setActiveTab('medical_search');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Inquiry Modal */}
      {activeInquiryProduct && (
        <InquiryModal
          product={activeInquiryProduct}
          onClose={() => setActiveInquiryProduct(null)}
          onSuccess={loadData}
        />
      )}

      {/* Minimal Editorial Footer (with clearance on mobile) */}
      <footer className="bg-white border-t border-slate-200 mt-6 sm:mt-12 py-5 sm:py-6 mb-16 md:mb-0 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PharmaBridge</span>
            <span aria-hidden="true">·</span>
            <span>Pharmaceutical MR & Wholesale Stockist Network</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>FDA & Drug Control Compliant</span>
            <span aria-hidden="true">·</span>
            <span>Direct WhatsApp & Call Ordering</span>
            <span aria-hidden="true">·</span>
            <span>Gemini Vision Invoice OCR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
