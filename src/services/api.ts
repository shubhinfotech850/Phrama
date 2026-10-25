import { supabase } from './supabaseClient';
import type { Product, Promotion, Agency, OrderInquiry, BillScanResult } from '../types/pharmacy';

// ---------- Row types (snake_case from Postgres) ----------
interface AgencyRow {
  id: string;
  name: string;
  contact_person: string;
  role: Agency['role'];
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  drug_license_no: string;
  gstin: string;
  companies_represented: string[];
  rating: number;
  delivery_eta: string;
  minimum_order_value: number | null;
}

interface ProductRow {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  pack_size: string;
  batch_no: string;
  mfg_date: string | null;
  exp_date: string;
  mrp: number;
  ptr: number;
  margin_percent: number | null;
  stock_qty: number;
  min_order_qty: number;
  agency_id: string;
  agency_name: string;
  agency_city: string;
  agency_address: string | null;
  mr_name: string;
  mr_phone: string;
  mr_email: string | null;
  company: string;
  scheme: string | null;
  is_new_release: boolean;
  verified: boolean;
  updated_at: string;
  source: Product['source'];
  bill_reference: string | null;
}

interface PromotionRow {
  id: string;
  tablet_name: string;
  generic_composition: string;
  company: string;
  launched_by: string;
  role: Promotion['role'];
  contact_phone: string;
  contact_whatsapp: string;
  launch_headline: string;
  key_indications: string[];
  intro_offer: string;
  ptr: number;
  mrp: number;
  sample_available: boolean;
  sample_stock: number | null;
  brochure_summary: string;
  target_doctors: string;
  territory: string;
  image_url: string | null;
  created_at: string;
}

interface InquiryRow {
  id: string;
  medical_store_name: string;
  pharmacist_name: string;
  phone: string;
  city: string;
  product_id: string;
  product_name: string;
  requested_qty: number;
  agency_id: string;
  agency_name: string;
  mr_name: string;
  mr_phone: string;
  notes: string | null;
  status: OrderInquiry['status'];
  created_at: string;
}

// ---------- Mappers ----------
const mapAgency = (r: AgencyRow): Agency => ({
  id: r.id,
  name: r.name,
  contactPerson: r.contact_person,
  role: r.role,
  phone: r.phone,
  whatsapp: r.whatsapp,
  email: r.email,
  city: r.city,
  state: r.state,
  drugLicenseNo: r.drug_license_no,
  gstin: r.gstin,
  companiesRepresented: r.companies_represented || [],
  rating: Number(r.rating),
  deliveryEta: r.delivery_eta,
  minimumOrderValue: r.minimum_order_value ?? undefined,
});

const mapProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  genericName: r.generic_name,
  category: r.category,
  dosageForm: r.dosage_form,
  packSize: r.pack_size,
  batchNo: r.batch_no,
  mfgDate: r.mfg_date || '',
  expDate: r.exp_date,
  mrp: Number(r.mrp),
  ptr: Number(r.ptr),
  marginPercent: r.margin_percent != null ? Number(r.margin_percent) : undefined,
  stockQty: r.stock_qty,
  minOrderQty: r.min_order_qty,
  agencyId: r.agency_id,
  agencyName: r.agency_name,
  agencyCity: r.agency_city,
  agencyAddress: r.agency_address || undefined,
  mrName: r.mr_name,
  mrPhone: r.mr_phone,
  mrEmail: r.mr_email || undefined,
  company: r.company,
  scheme: r.scheme || undefined,
  isNewRelease: r.is_new_release,
  verified: r.verified,
  updatedAt: r.updated_at,
  source: r.source,
  billReference: r.bill_reference || undefined,
});

const mapPromotion = (r: PromotionRow): Promotion => ({
  id: r.id,
  tabletName: r.tablet_name,
  genericComposition: r.generic_composition,
  company: r.company,
  launchedBy: r.launched_by,
  role: r.role,
  contactPhone: r.contact_phone,
  contactWhatsapp: r.contact_whatsapp,
  launchHeadline: r.launch_headline,
  keyIndications: r.key_indications || [],
  introOffer: r.intro_offer,
  ptr: Number(r.ptr),
  mrp: Number(r.mrp),
  sampleAvailable: r.sample_available,
  sampleStock: r.sample_stock ?? undefined,
  brochureSummary: r.brochure_summary,
  targetDoctors: r.target_doctors,
  territory: r.territory,
  createdAt: r.created_at,
  imageUrl: r.image_url || undefined,
});

const mapInquiry = (r: InquiryRow): OrderInquiry => ({
  id: r.id,
  medicalStoreName: r.medical_store_name,
  pharmacistName: r.pharmacist_name,
  phone: r.phone,
  city: r.city,
  productId: r.product_id,
  productName: r.product_name,
  requestedQty: r.requested_qty,
  agencyId: r.agency_id,
  agencyName: r.agency_name,
  mrName: r.mr_name,
  mrPhone: r.mr_phone,
  notes: r.notes || undefined,
  status: r.status,
  createdAt: r.created_at,
});

const toProductInsert = (p: Omit<Product, 'id' | 'updatedAt'>) => ({
  name: p.name,
  generic_name: p.genericName,
  category: p.category,
  dosage_form: p.dosageForm,
  pack_size: p.packSize,
  batch_no: p.batchNo,
  mfg_date: p.mfgDate || null,
  exp_date: p.expDate,
  mrp: p.mrp,
  ptr: p.ptr,
  margin_percent: p.marginPercent ?? null,
  stock_qty: p.stockQty,
  min_order_qty: p.minOrderQty,
  agency_id: p.agencyId,
  agency_name: p.agencyName,
  agency_city: p.agencyCity,
  agency_address: p.agencyAddress || null,
  mr_name: p.mrName,
  mr_phone: p.mrPhone,
  mr_email: p.mrEmail || null,
  company: p.company,
  scheme: p.scheme || null,
  is_new_release: p.isNewRelease ?? false,
  verified: p.verified,
  source: p.source,
  bill_reference: p.billReference || null,
});

const toPromotionInsert = (p: Omit<Promotion, 'id' | 'createdAt'>) => ({
  tablet_name: p.tabletName,
  generic_composition: p.genericComposition,
  company: p.company,
  launched_by: p.launchedBy,
  role: p.role,
  contact_phone: p.contactPhone,
  contact_whatsapp: p.contactWhatsapp,
  launch_headline: p.launchHeadline,
  key_indications: p.keyIndications,
  intro_offer: p.introOffer,
  ptr: p.ptr,
  mrp: p.mrp,
  sample_available: p.sampleAvailable,
  sample_stock: p.sampleStock ?? null,
  brochure_summary: p.brochureSummary,
  target_doctors: p.targetDoctors,
  territory: p.territory,
  image_url: p.imageUrl || null,
});

const toInquiryInsert = (i: Omit<OrderInquiry, 'id' | 'createdAt' | 'status'>) => ({
  medical_store_name: i.medicalStoreName,
  pharmacist_name: i.pharmacistName,
  phone: i.phone,
  city: i.city,
  product_id: i.productId,
  product_name: i.productName,
  requested_qty: i.requestedQty,
  agency_id: i.agencyId,
  agency_name: i.agencyName,
  mr_name: i.mrName,
  mr_phone: i.mrPhone,
  notes: i.notes || null,
});

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

// ---------- API ----------

export async function fetchProducts(query?: string, category?: string, agencyId?: string): Promise<Product[]> {
  let q = supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false });

  if (agencyId) q = q.eq('agency_id', agencyId);
  if (category && category !== 'All') q = q.ilike('category', `%${category}%`);
  if (query && query.trim()) {
    const term = query.trim();
    // or filter across multiple text columns
    q = q.or(
      `name.ilike.%${term}%,generic_name.ilike.%${term}%,company.ilike.%${term}%,batch_no.ilike.%${term}%,agency_name.ilike.%${term}%,mr_name.ilike.%${term}%`
    );
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapProduct);
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as PromotionRow[]).map(mapPromotion);
}

export async function fetchAgencies(): Promise<Agency[]> {
  const { data, error } = await supabase.from('agencies').select('*').order('name');
  if (error) throw new Error(error.message);
  return (data as AgencyRow[]).map(mapAgency);
}

export async function fetchInquiries(agencyId?: string): Promise<OrderInquiry[]> {
  let q = supabase.from('inquiries').select('*');
  if (agencyId) q = q.eq('agency_id', agencyId);
  q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as InquiryRow[]).map(mapInquiry);
}

export async function scanBillWithGemini(imageBase64: string, mimeType = 'image/jpeg'): Promise<BillScanResult> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-bill`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error || `Scan failed (${res.status})`);
  }
  const json = await res.json();
  return json.data as BillScanResult;
}

export async function saveBatchProducts(products: Array<Omit<Product, 'id' | 'updatedAt'>>): Promise<Product[]> {
  const rows = products.map((p) => ({ id: genId('prod'), ...toProductInsert(p) }));
  const { data, error } = await supabase.from('products').insert(rows).select();
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapProduct);
}

export async function createProduct(product: Omit<Product, 'id' | 'updatedAt'>): Promise<Product> {
  const row = { id: genId('prod'), ...toProductInsert(product) };
  const { data, error } = await supabase.from('products').insert(row).select().maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Failed to create product');
  return mapProduct(data as ProductRow);
}

export async function createPromotion(promo: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion> {
  const row = { id: genId('promo'), ...toPromotionInsert(promo) };
  const { data, error } = await supabase.from('promotions').insert(row).select().maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Failed to create promotion');

  // Mirror the previous backend behaviour: also register a "New Release" product
  // listing if one does not already exist for this tablet name.
  const promoRow = data as PromotionRow;
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .ilike('name', promo.tabletName)
    .maybeSingle();

  if (!existing) {
    const margin = promo.mrp > promo.ptr ? Math.round(((promo.mrp - promo.ptr) / promo.mrp) * 1000) / 10 : 30;
    const productRow = {
      id: genId('prod'),
      name: promo.tabletName,
      generic_name: promo.genericComposition,
      category: 'New Release / Specialty',
      dosage_form: 'Tablet',
      pack_size: '1 x 10 Tablets (Strip)',
      batch_no: `REL-${new Date().getFullYear()}`,
      mfg_date: new Date().toISOString().split('T')[0],
      exp_date: new Date(Date.now() + 365 * 2 * 24 * 3600000).toISOString().split('T')[0],
      mrp: promo.mrp,
      ptr: promo.ptr,
      margin_percent: margin,
      stock_qty: 500,
      min_order_qty: 5,
      agency_id: 'ag-promo',
      agency_name: promo.launchedBy,
      agency_city: promo.territory.split(',')[0]?.trim() || 'Regional Hub',
      agency_address: null,
      mr_name: promo.launchedBy,
      mr_phone: promo.contactPhone,
      mr_email: null,
      company: promo.company,
      scheme: promo.introOffer,
      is_new_release: true,
      verified: true,
      source: 'promotion' as const,
      bill_reference: null,
    };
    await supabase.from('products').insert(productRow);
  }

  return mapPromotion(promoRow);
}

export async function submitOrderInquiry(inquiry: Omit<OrderInquiry, 'id' | 'createdAt' | 'status'>): Promise<OrderInquiry> {
  const row = { id: genId('inq'), status: 'Pending' as const, ...toInquiryInsert(inquiry) };
  const { data, error } = await supabase.from('inquiries').insert(row).select().maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Failed to submit inquiry');
  return mapInquiry(data as InquiryRow);
}

export async function updateInquiryStatus(id: string, status: 'Pending' | 'Confirmed' | 'Dispatched'): Promise<OrderInquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Inquiry not found');
  return mapInquiry(data as InquiryRow);
}

export async function fetchStats() {
  const [productsRes, promotionsRes, agenciesRes, inquiriesRes] = await Promise.all([
    supabase.from('products').select('stock_qty'),
    supabase.from('promotions').select('id', { count: 'exact', head: true }),
    supabase.from('agencies').select('id, role'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
  ]);

  if (productsRes.error) throw new Error(productsRes.error.message);
  if (agenciesRes.error) throw new Error(agenciesRes.error.message);

  const products = (productsRes.data as { stock_qty: number }[]) || [];
  const agencies = (agenciesRes.data as { id: string; role: Agency['role'] }[]) || [];

  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock_qty || 0), 0);
  const totalAgencies = agencies.filter((a) => a.role === 'Agency Stockist').length;
  const totalMRs = agencies.filter((a) => a.role === 'Medical Representative (MR)').length;

  return {
    totalProducts: products.length,
    totalPromotions: promotionsRes.count || 0,
    totalAgencies,
    totalMRs,
    totalInquiries: inquiriesRes.count || 0,
    totalStockUnits,
  };
}
