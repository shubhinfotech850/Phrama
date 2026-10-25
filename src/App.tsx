import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MedicalStoreView } from './components/MedicalStoreView';
import { BillScanner } from './components/BillScanner';
import { NewReleasePromotions } from './components/NewReleasePromotions';
import { AgencyInventoryManager } from './components/AgencyInventoryManager';
import { AgencyDashboard } from './components/AgencyDashboard';
import { AgencyDirectory } from './components/AgencyDirectory';
import { InquiryModal } from './components/InquiryModal';
import { LoginScreen } from './components/LoginScreen';
import type { Product, Promotion, Agency, OrderInquiry, UserRole } from './types/pharmacy';
import { fetchProducts, fetchPromotions, fetchAgencies, fetchInquiries } from './services/api';
import { Pill, RefreshCw } from 'lucide-react';
import { useI18n } from './services/i18n';

const AUTH_STORAGE_KEY = 'pharmabridge_auth';

function loadStoredSession(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.userId && parsed.loggedInAt);
  } catch {
    return false;
  }
}

export default function App() {
  const { t } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStoredSession());
  const [activeTab, setActiveTab] = useState<'medical_search' | 'bill_scanner' | 'new_releases' | 'agency_portal' | 'agency_dashboard' | 'directory'>('medical_search');
  const [userRole, setUserRole] = useState<UserRole>('medical_store');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [inquiries, setInquiries] = useState<OrderInquiry[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inquiry modal state
  const [activeInquiryProduct, setActiveInquiryProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, promos, ags, inqs] = await Promise.all([
        fetchProducts(),
        fetchPromotions(),
        fetchAgencies(),
        fetchInquiries(),
      ]);
      setProducts(prods);
      setPromotions(promos);
      setAgencies(ags);
      setInquiries(inqs);
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
      setActiveTab('agency_dashboard');
    } else if (role === 'medical_store' && (activeTab === 'bill_scanner' || activeTab === 'agency_portal' || activeTab === 'agency_dashboard')) {
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

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    setIsAuthenticated(false);
    setActiveTab('medical_search');
    setUserRole('medical_store');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Primary Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={handleRoleChange}
        pendingInquiriesCount={pendingInquiriesCount}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport with mobile bottom bar clearance */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-9 h-9 text-teal-600 animate-spin mb-3" />
            <p className="text-base font-semibold text-slate-800">{t('load.connecting')}</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3 max-w-md mx-auto mt-12">
            <p className="text-base font-bold text-rose-900">{t('error.connectionTitle')}</p>
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={loadData}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg"
            >
              {t('action.retry')}
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
                canPublish={userRole === 'mr_agency'}
              />
            )}

            {activeTab === 'agency_dashboard' && (
              <AgencyDashboard
                products={products}
                inquiries={inquiries}
                agencies={agencies}
                onNavigateInquiries={() => setActiveTab('agency_portal')}
                onNavigateInventory={() => setActiveTab('agency_portal')}
                onNavigateScanner={() => setActiveTab('bill_scanner')}
                onAddProduct={() => setActiveTab('agency_portal')}
                onProductAdded={loadData}
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

      {/* Minimal footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 py-5 mb-16 md:mb-0 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold text-slate-800">{t('app.name')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('app.tagline')}</span>
          </div>
          <span>{t('app.footerNote')}</span>
        </div>
      </footer>
    </div>
  );
}
