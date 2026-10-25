import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Product, Promotion, Agency, OrderInquiry } from '../src/types/pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'pharma_db.json');

interface DatabaseSchema {
  products: Product[];
  promotions: Promotion[];
  agencies: Agency[];
  inquiries: OrderInquiry[];
}

const DEFAULT_AGENCIES: Agency[] = [
  {
    id: 'ag-1',
    name: 'Apex Pharma Distributors Pvt. Ltd.',
    contactPerson: 'Sunil Verma (Wholesale Head)',
    role: 'Agency Stockist',
    phone: '+91 98230 44120',
    whatsapp: '919823044120',
    email: 'orders@apexpharmadist.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    drugLicenseNo: 'MH-MZ4-192841',
    gstin: '27AABCA1234F1Z8',
    companiesRepresented: ['GSK', 'Sun Pharma', 'Cipla', 'Abbott'],
    rating: 4.9,
    deliveryEta: 'Same Day (within 3 hrs)',
    minimumOrderValue: 2000
  },
  {
    id: 'ag-2',
    name: 'Rajesh Sharma',
    contactPerson: 'Rajesh Sharma',
    role: 'Medical Representative (MR)',
    phone: '+91 98112 55901',
    whatsapp: '919811255901',
    email: 'r.sharma@microlabs.co.in',
    city: 'Mumbai & Thane',
    state: 'Maharashtra',
    drugLicenseNo: 'MR-HQ-88219',
    gstin: '27AACPM9812A1ZX',
    companiesRepresented: ['Micro Labs Ltd.'],
    rating: 4.8,
    deliveryEta: 'Next Day Morning',
    minimumOrderValue: 1500
  },
  {
    id: 'ag-3',
    name: 'Metro Healthcare Agencies',
    contactPerson: 'Anand Kulkarni (Managing Partner)',
    role: 'Agency Stockist',
    phone: '+91 98701 92840',
    whatsapp: '919870192840',
    email: 'dispatch@metrohealthagencies.com',
    city: 'Pune',
    state: 'Maharashtra',
    drugLicenseNo: 'MH-PZ2-491028',
    gstin: '27AAECM5541L1Z0',
    companiesRepresented: ['Alkem Laboratories', 'Torrent Pharma', 'Lupin', 'Mankind'],
    rating: 4.7,
    deliveryEta: 'Within 4 Hours',
    minimumOrderValue: 2500
  },
  {
    id: 'ag-4',
    name: 'Pooja Deshmukh',
    contactPerson: 'Pooja Deshmukh',
    role: 'Medical Representative (MR)',
    phone: '+91 98450 11982',
    whatsapp: '919845011982',
    email: 'pooja.d@sunpharma.com',
    city: 'Mumbai Central & South',
    state: 'Maharashtra',
    drugLicenseNo: 'MR-SP-33910',
    gstin: '27AAMPS7711K1Z2',
    companiesRepresented: ['Sun Pharma Industries'],
    rating: 4.9,
    deliveryEta: 'Direct MR Booking (Same Day)',
    minimumOrderValue: 1000
  },
  {
    id: 'ag-5',
    name: 'Shree Balaji Medical Wholesale',
    contactPerson: 'Ramesh Patel',
    role: 'Agency Stockist',
    phone: '+91 98205 33491',
    whatsapp: '919820533491',
    email: 'balajimedicalorders@gmail.com',
    city: 'Nagpur',
    state: 'Maharashtra',
    drugLicenseNo: 'MH-NG1-772910',
    gstin: '27AASPM4421B1ZU',
    companiesRepresented: ['Glenmark', 'Zydus Cadila', 'Dr. Reddys', 'Intas'],
    rating: 4.6,
    deliveryEta: '24 Hours Express',
    minimumOrderValue: 3000
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    packSize: '1 x 10 Tablets (Strip)',
    batchNo: 'AG8921',
    mfgDate: '2026-01-10',
    expDate: '2027-12-31',
    mrp: 223.50,
    ptr: 159.60,
    marginPercent: 28.6,
    stockQty: 850,
    minOrderQty: 10,
    agencyId: 'ag-1',
    agencyName: 'Apex Pharma Distributors Pvt. Ltd.',
    agencyCity: 'Mumbai',
    agencyAddress: 'Shop 12-14, Medical Complex, Andheri East',
    mrName: 'Vikram Joshi (GSK Division)',
    mrPhone: '+91 98230 44120',
    company: 'GSK Pharmaceuticals Ltd.',
    scheme: '10 + 1 Free Scheme',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'bill_scan',
    billReference: 'AP-INV-2026-881'
  },
  {
    id: 'prod-2',
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    packSize: '1 x 10 Tablets (Strip)',
    batchNo: 'AG8914',
    mfgDate: '2025-12-05',
    expDate: '2027-11-30',
    mrp: 223.50,
    ptr: 158.00,
    marginPercent: 29.3,
    stockQty: 420,
    minOrderQty: 20,
    agencyId: 'ag-3',
    agencyName: 'Metro Healthcare Agencies',
    agencyCity: 'Pune',
    agencyAddress: 'Gala 4, Wholesale Pharma Market, Swargate',
    mrName: 'Sanjay Shinde',
    mrPhone: '+91 98701 92840',
    company: 'GSK Pharmaceuticals Ltd.',
    scheme: 'Cash Discount 4% on 50+ strips',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'manual'
  },
  {
    id: 'prod-3',
    name: 'Dolo 650',
    genericName: 'Paracetamol (650mg)',
    category: 'Analgesic & Antipyretic',
    dosageForm: 'Tablet',
    packSize: '1 x 15 Tablets (Strip)',
    batchNo: 'DL2309',
    mfgDate: '2026-02-01',
    expDate: '2028-01-31',
    mrp: 34.50,
    ptr: 24.60,
    marginPercent: 28.7,
    stockQty: 3200,
    minOrderQty: 30,
    agencyId: 'ag-2',
    agencyName: 'Rajesh Sharma',
    agencyCity: 'Mumbai & Thane',
    agencyAddress: 'Micro Labs Zonal Office, Mulund',
    mrName: 'Rajesh Sharma (Direct MR)',
    mrPhone: '+91 98112 55901',
    company: 'Micro Labs Ltd.',
    scheme: 'Special Box Rate: ₹23.80/strip on 100+ strips',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'bill_scan',
    billReference: 'ML-BILL-4421'
  },
  {
    id: 'prod-4',
    name: 'Pan 40',
    genericName: 'Pantoprazole Gastro-Resistant (40mg)',
    category: 'Antacid / PPI',
    dosageForm: 'Tablet',
    packSize: '1 x 15 Tablets (Strip)',
    batchNo: 'PN7710',
    mfgDate: '2026-01-15',
    expDate: '2028-06-30',
    mrp: 178.00,
    ptr: 126.30,
    marginPercent: 29.0,
    stockQty: 1100,
    minOrderQty: 15,
    agencyId: 'ag-3',
    agencyName: 'Metro Healthcare Agencies',
    agencyCity: 'Pune',
    agencyAddress: 'Gala 4, Wholesale Pharma Market, Swargate',
    mrName: 'Sameer Dighe (Alkem)',
    mrPhone: '+91 98701 92840',
    company: 'Alkem Laboratories',
    scheme: '15 + 1 Free Scheme',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'bill_scan',
    billReference: 'ALK-INV-9902'
  },
  {
    id: 'prod-5',
    name: 'Pantocid 40',
    genericName: 'Pantoprazole Gastro-Resistant (40mg)',
    category: 'Antacid / PPI',
    dosageForm: 'Tablet',
    packSize: '1 x 15 Tablets (Strip)',
    batchNo: 'PT4412',
    mfgDate: '2026-01-20',
    expDate: '2027-12-31',
    mrp: 182.00,
    ptr: 128.50,
    marginPercent: 29.4,
    stockQty: 680,
    minOrderQty: 10,
    agencyId: 'ag-4',
    agencyName: 'Pooja Deshmukh',
    agencyCity: 'Mumbai Central & South',
    agencyAddress: 'Sun Pharma Field HQ, Dadar',
    mrName: 'Pooja Deshmukh (Sun Gastro)',
    mrPhone: '+91 98450 11982',
    company: 'Sun Pharma Industries',
    scheme: '10 + 1 Scheme + Free Clinic Standee',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'manual'
  },
  {
    id: 'prod-6',
    name: 'Telma 40',
    genericName: 'Telmisartan (40mg)',
    category: 'Cardiovascular / Antihypertensive',
    dosageForm: 'Tablet',
    packSize: '1 x 30 Tablets (Bottle)',
    batchNo: 'TL9918',
    mfgDate: '2026-02-10',
    expDate: '2028-02-28',
    mrp: 248.00,
    ptr: 176.00,
    marginPercent: 29.0,
    stockQty: 540,
    minOrderQty: 10,
    agencyId: 'ag-1',
    agencyName: 'Apex Pharma Distributors Pvt. Ltd.',
    agencyCity: 'Mumbai',
    agencyAddress: 'Shop 12-14, Medical Complex, Andheri East',
    mrName: 'Sunil Verma',
    mrPhone: '+91 98230 44120',
    company: 'Glenmark Pharmaceuticals',
    scheme: '5% extra on 25+ bottles',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'bill_scan',
    billReference: 'GLN-7731'
  },
  {
    id: 'prod-7',
    name: 'Montair-LC',
    genericName: 'Montelukast (10mg) + Levocetirizine (5mg)',
    category: 'Antiallergic & Respiratory',
    dosageForm: 'Tablet',
    packSize: '1 x 10 Tablets (Strip)',
    batchNo: 'MLC502',
    mfgDate: '2026-01-18',
    expDate: '2028-04-30',
    mrp: 215.00,
    ptr: 152.00,
    marginPercent: 29.3,
    stockQty: 950,
    minOrderQty: 15,
    agencyId: 'ag-1',
    agencyName: 'Apex Pharma Distributors Pvt. Ltd.',
    agencyCity: 'Mumbai',
    agencyAddress: 'Shop 12-14, Medical Complex, Andheri East',
    mrName: 'Deepak Rao (Cipla Breathe)',
    mrPhone: '+91 98230 44120',
    company: 'Cipla Ltd.',
    scheme: '10 + 1 Free Scheme',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'bill_scan'
  },
  {
    id: 'prod-8',
    name: 'Azithral 500',
    genericName: 'Azithromycin (500mg)',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    packSize: '1 x 5 Tablets (Strip)',
    batchNo: 'AZ6610',
    mfgDate: '2026-02-12',
    expDate: '2027-10-31',
    mrp: 132.00,
    ptr: 93.70,
    marginPercent: 29.0,
    stockQty: 1400,
    minOrderQty: 25,
    agencyId: 'ag-3',
    agencyName: 'Metro Healthcare Agencies',
    agencyCity: 'Pune',
    agencyAddress: 'Gala 4, Wholesale Pharma Market, Swargate',
    mrName: 'Anand Kulkarni',
    mrPhone: '+91 98701 92840',
    company: 'Alembic Pharmaceuticals',
    scheme: '20 + 2 Free Scheme',
    isNewRelease: false,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'bill_scan'
  },
  {
    id: 'prod-9',
    name: 'Nexetra 10mg SR',
    genericName: 'Vonoprazan Fumarate Sustained Release (10mg)',
    category: 'Antacid / Potassium-Competitive Acid Blocker (P-CAB)',
    dosageForm: 'Tablet',
    packSize: '1 x 10 Tablets (Strip)',
    batchNo: 'NX4012A',
    mfgDate: '2026-03-01',
    expDate: '2028-02-28',
    mrp: 195.00,
    ptr: 134.00,
    marginPercent: 31.2,
    stockQty: 600,
    minOrderQty: 10,
    agencyId: 'ag-4',
    agencyName: 'Pooja Deshmukh',
    agencyCity: 'Mumbai Central & South',
    agencyAddress: 'Sun Pharma Field HQ, Dadar',
    mrName: 'Pooja Deshmukh (Direct MR)',
    mrPhone: '+91 98450 11982',
    company: 'Sun Pharma Industries',
    scheme: 'LAUNCH OFFER: 10 + 2 Free + 5 Free Doctor Trial Packs',
    isNewRelease: true,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'promotion'
  },
  {
    id: 'prod-10',
    name: 'Covifex 500mg',
    genericName: 'Faropenem Sodium Extended Release (500mg)',
    category: 'Advanced Antibiotic (Penem)',
    dosageForm: 'Tablet',
    packSize: '1 x 6 Film-Coated Tablets',
    batchNo: 'CF8820',
    mfgDate: '2026-02-25',
    expDate: '2027-11-30',
    mrp: 480.00,
    ptr: 336.00,
    marginPercent: 30.0,
    stockQty: 380,
    minOrderQty: 5,
    agencyId: 'ag-2',
    agencyName: 'Rajesh Sharma',
    agencyCity: 'Mumbai & Thane',
    agencyAddress: 'Micro Labs Zonal Office, Mulund',
    mrName: 'Rajesh Sharma',
    mrPhone: '+91 98112 55901',
    company: 'Micro Labs Ltd.',
    scheme: 'NEW RELEASE: 5 + 1 Free + Detailing Kit for Chest Physicians',
    isNewRelease: true,
    verified: true,
    updatedAt: new Date().toISOString(),
    source: 'promotion'
  }
];

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    tabletName: 'Nexetra 10mg SR',
    genericComposition: 'Vonoprazan Fumarate Sustained Release (10mg)',
    company: 'Sun Pharma Industries',
    launchedBy: 'Pooja Deshmukh (Zonal MR)',
    role: 'MR',
    contactPhone: '+91 98450 11982',
    contactWhatsapp: '919845011982',
    launchHeadline: 'Next-Gen P-CAB Acid Relief: Faster Onset than Conventional PPIs',
    keyIndications: [
      'Refractory GERD & Nocturnal Acid Breakthrough',
      'Erosive Esophagitis healing in under 4 weeks',
      'H. Pylori Eradication dual/triple therapy regimen'
    ],
    introOffer: 'Launch Incentive: 10 + 2 Free Strips + Complimentary Doctor Sample Folders',
    ptr: 134.00,
    mrp: 195.00,
    sampleAvailable: true,
    sampleStock: 120,
    brochureSummary: 'Vonoprazan provides sustained acid suppression above pH 4 for >24 hours with no food effect, outperforming traditional PPIs like omeprazole and pantoprazole.',
    targetDoctors: 'Gastroenterologists, General Physicians, Consulting Surgeons',
    territory: 'Mumbai, Thane, Navi Mumbai, Pune',
    createdAt: new Date().toISOString()
  },
  {
    id: 'promo-2',
    tabletName: 'Covifex 500mg',
    genericComposition: 'Faropenem Sodium Extended Release (500mg)',
    company: 'Micro Labs Ltd.',
    launchedBy: 'Rajesh Sharma (Hospital & Specialty MR)',
    role: 'MR',
    contactPhone: '+91 98112 55901',
    contactWhatsapp: '919811255901',
    launchHeadline: 'Oral Penem of Choice for Multi-Drug Resistant Community Respiratory Infections',
    keyIndications: [
      'Community-Acquired Pneumonia (CAP)',
      'Complicated Upper & Lower Respiratory Tract Infections',
      'Recurrent Acute Otitis Media & Sinusitis'
    ],
    introOffer: 'Introductory 5 + 1 Bonus Strip + Free CME Clinical Detailing Literature',
    ptr: 336.00,
    mrp: 480.00,
    sampleAvailable: true,
    sampleStock: 80,
    brochureSummary: 'High stability against beta-lactamases and ESBL-producing pathogens with superior tolerability compared to standard carbapenems without requiring IV hospitalization.',
    targetDoctors: 'Pulmonologists, Chest Physicians, ENT Specialists, Intensivists',
    territory: 'Western Maharashtra & Mumbai',
    createdAt: new Date().toISOString()
  },
  {
    id: 'promo-3',
    tabletName: 'Lipocad-Gold 20',
    genericComposition: 'Rosuvastatin (20mg) + Aspirin (75mg) + Clopidogrel (75mg)',
    company: 'Apex Pharma Distributors (C&F for Torrent)',
    launchedBy: 'Apex Pharma Distributors Pvt. Ltd.',
    role: 'Agency',
    contactPhone: '+91 98230 44120',
    contactWhatsapp: '919823044120',
    launchHeadline: 'Triple-Action Fixed Dose Cardio Protection Capsule with Gold-Standard Bioavailability',
    keyIndications: [
      'Secondary Prevention of Acute Coronary Syndromes (ACS)',
      'Post-PCI / Post-Stent Antiplatelet & Lipid Lowering',
      'High-Risk Atherosclerotic Cardiovascular Disease'
    ],
    introOffer: 'Special Agency Bulk Launch: 20 + 3 Free + Priority Dispatch Guarantee',
    ptr: 210.00,
    mrp: 299.00,
    sampleAvailable: true,
    sampleStock: 65,
    brochureSummary: 'Ensures optimal patient compliance by combining three crucial cardioprotective agents into a single once-daily capsule with enteric-coated pellets.',
    targetDoctors: 'Cardiologists, Diabetologists, Internal Medicine Consultants',
    territory: 'Pan-Maharashtra Distributors Hub',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_INQUIRIES: OrderInquiry[] = [
  {
    id: 'inq-1',
    medicalStoreName: 'Sanjivani Chemist & Druggist',
    pharmacistName: 'Kailash Mehta',
    phone: '+91 98221 00412',
    city: 'Mumbai',
    productId: 'prod-1',
    productName: 'Augmentin 625 Duo',
    requestedQty: 50,
    agencyId: 'ag-1',
    agencyName: 'Apex Pharma Distributors Pvt. Ltd.',
    mrName: 'Vikram Joshi (GSK Division)',
    mrPhone: '+91 98230 44120',
    notes: 'Urgent stock needed for evening rush, please apply 10+1 scheme.',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'inq-2',
    medicalStoreName: 'Lifeline Medico',
    pharmacistName: 'Dr. Rahul Patwardhan',
    phone: '+91 98601 22849',
    city: 'Pune',
    productId: 'prod-9',
    productName: 'Nexetra 10mg SR',
    requestedQty: 20,
    agencyId: 'ag-4',
    agencyName: 'Pooja Deshmukh',
    mrName: 'Pooja Deshmukh (Direct MR)',
    mrPhone: '+91 98450 11982',
    notes: 'Please also send 2 doctor trial samples for Dr. Hegde Clinic nearby.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

class PharmaDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products?.length ? parsed.products : DEFAULT_PRODUCTS,
          promotions: parsed.promotions?.length ? parsed.promotions : DEFAULT_PROMOTIONS,
          agencies: parsed.agencies?.length ? parsed.agencies : DEFAULT_AGENCIES,
          inquiries: parsed.inquiries?.length ? parsed.inquiries : DEFAULT_INQUIRIES,
        };
      }
    } catch (err) {
      console.warn('Error reading db file, falling back to defaults:', err);
    }

    const initial = {
      products: DEFAULT_PRODUCTS,
      promotions: DEFAULT_PROMOTIONS,
      agencies: DEFAULT_AGENCIES,
      inquiries: DEFAULT_INQUIRIES
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db file:', err);
    }
  }

  getProducts(query?: string, category?: string, agencyId?: string): Product[] {
    let result = [...this.data.products];

    if (agencyId) {
      result = result.filter(p => p.agencyId === agencyId);
    }

    if (category && category !== 'All') {
      result = result.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.batchNo.toLowerCase().includes(q) ||
        p.agencyName.toLowerCase().includes(q) ||
        p.mrName.toLowerCase().includes(q)
      );
    }

    // Sort by recent update
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(product: Omit<Product, 'id' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.saveData(this.data);
    return newProduct;
  }

  addBatchProducts(products: Array<Omit<Product, 'id' | 'updatedAt'>>): Product[] {
    const now = new Date().toISOString();
    const created: Product[] = products.map((p, idx) => ({
      ...p,
      id: `prod-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: now
    }));

    this.data.products = [...created, ...this.data.products];
    this.saveData(this.data);
    return created;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const lenBefore = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== lenBefore) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  getPromotions(): Promotion[] {
    return [...this.data.promotions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addPromotion(promo: Omit<Promotion, 'id' | 'createdAt'>): Promotion {
    const newPromo: Promotion = {
      ...promo,
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.promotions.unshift(newPromo);

    // Also register into products collection as a new release listing if not already present
    const existing = this.data.products.find(p => p.name.toLowerCase() === promo.tabletName.toLowerCase());
    if (!existing) {
      const margin = promo.mrp > promo.ptr ? Math.round(((promo.mrp - promo.ptr) / promo.mrp) * 100 * 10) / 10 : 30;
      this.data.products.unshift({
        id: `prod-${Date.now()}-launch`,
        name: promo.tabletName,
        genericName: promo.genericComposition,
        category: 'New Release / Specialty',
        dosageForm: 'Tablet',
        packSize: '1 x 10 Tablets (Strip)',
        batchNo: `REL-${new Date().getFullYear()}`,
        mfgDate: new Date().toISOString().split('T')[0],
        expDate: new Date(Date.now() + 365 * 2 * 24 * 3600000).toISOString().split('T')[0],
        mrp: promo.mrp,
        ptr: promo.ptr,
        marginPercent: margin,
        stockQty: 500,
        minOrderQty: 5,
        agencyId: 'ag-promo',
        agencyName: promo.launchedBy,
        agencyCity: promo.territory.split(',')[0]?.trim() || 'Regional Hub',
        mrName: promo.launchedBy,
        mrPhone: promo.contactPhone,
        company: promo.company,
        scheme: promo.introOffer,
        isNewRelease: true,
        verified: true,
        updatedAt: new Date().toISOString(),
        source: 'promotion'
      });
    }

    this.saveData(this.data);
    return newPromo;
  }

  getAgencies(): Agency[] {
    return this.data.agencies;
  }

  getInquiries(agencyId?: string): OrderInquiry[] {
    if (agencyId) {
      return this.data.inquiries.filter(i => i.agencyId === agencyId);
    }
    return [...this.data.inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addInquiry(inquiry: Omit<OrderInquiry, 'id' | 'createdAt' | 'status'>): OrderInquiry {
    const newInquiry: OrderInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.data.inquiries.unshift(newInquiry);
    this.saveData(this.data);
    return newInquiry;
  }

  updateInquiryStatus(id: string, status: 'Pending' | 'Confirmed' | 'Dispatched'): OrderInquiry | null {
    const item = this.data.inquiries.find(i => i.id === id);
    if (!item) return null;
    item.status = status;
    this.saveData(this.data);
    return item;
  }
}

export const db = new PharmaDatabase();
