export interface Product {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string; // 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops' | 'Ointment';
  packSize: string; // e.g., '10x10 Strips', '15 Tablets/Strip'
  batchNo: string;
  mfgDate: string;
  expDate: string;
  mrp: number;
  ptr: number; // Price to Retailer
  marginPercent?: number;
  stockQty: number; // In strips/boxes
  minOrderQty: number;
  agencyId: string;
  agencyName: string;
  agencyCity: string;
  agencyAddress?: string;
  mrName: string;
  mrPhone: string;
  mrEmail?: string;
  company: string;
  scheme?: string; // e.g., '10 + 1 Free', '5% Off on 50+ strips'
  isNewRelease?: boolean;
  verified: boolean;
  updatedAt: string;
  source: 'bill_scan' | 'manual' | 'promotion';
  billReference?: string;
}

export interface Promotion {
  id: string;
  tabletName: string;
  genericComposition: string;
  company: string;
  launchedBy: string; // MR or Agency Name
  role: 'MR' | 'Agency';
  contactPhone: string;
  contactWhatsapp: string;
  launchHeadline: string;
  keyIndications: string[];
  introOffer: string;
  ptr: number;
  mrp: number;
  sampleAvailable: boolean;
  sampleStock?: number;
  brochureSummary: string;
  targetDoctors: string;
  territory: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Agency {
  id: string;
  name: string;
  contactPerson: string;
  role: 'Agency Stockist' | 'Medical Representative (MR)';
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  drugLicenseNo: string;
  gstin: string;
  companiesRepresented: string[];
  rating: number;
  deliveryEta: string;
  minimumOrderValue?: number;
}

export interface OrderInquiry {
  id: string;
  medicalStoreName: string;
  pharmacistName: string;
  phone: string;
  city: string;
  productId: string;
  productName: string;
  requestedQty: number;
  agencyId: string;
  agencyName: string;
  mrName: string;
  mrPhone: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Dispatched';
  createdAt: string;
}

export interface BillScanResult {
  distributorName: string;
  gstin?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  totalAmount?: number;
  items: Array<{
    name: string;
    genericName?: string;
    batchNo: string;
    expDate: string;
    packSize?: string;
    mrp: number;
    ptr: number;
    qty: number;
    scheme?: string;
    company?: string;
  }>;
}

export type UserRole = 'medical_store' | 'mr_agency';
