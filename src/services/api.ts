import type { Product, Promotion, Agency, OrderInquiry, BillScanResult } from '../types/pharmacy';

export async function fetchProducts(query?: string, category?: string, agencyId?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category && category !== 'All') params.set('category', category);
  if (agencyId) params.set('agencyId', agencyId);

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products || [];
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const res = await fetch('/api/promotions');
  if (!res.ok) throw new Error('Failed to fetch promotions');
  const data = await res.json();
  return data.promotions || [];
}

export async function fetchAgencies(): Promise<Agency[]> {
  const res = await fetch('/api/agencies');
  if (!res.ok) throw new Error('Failed to fetch agencies');
  const data = await res.json();
  return data.agencies || [];
}

export async function fetchInquiries(agencyId?: string): Promise<OrderInquiry[]> {
  const url = agencyId ? `/api/inquiries?agencyId=${encodeURIComponent(agencyId)}` : '/api/inquiries';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch inquiries');
  const data = await res.json();
  return data.inquiries || [];
}

export async function scanBillWithGemini(imageBase64: string, mimeType = 'image/jpeg'): Promise<BillScanResult> {
  const res = await fetch('/api/scan-bill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to scan bill');
  }
  const data = await res.json();
  return data.data;
}

export async function saveBatchProducts(products: Array<Omit<Product, 'id' | 'updatedAt'>>): Promise<Product[]> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  });
  if (!res.ok) throw new Error('Failed to save products');
  const data = await res.json();
  return data.products;
}

export async function createProduct(product: Omit<Product, 'id' | 'updatedAt'>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product }),
  });
  if (!res.ok) throw new Error('Failed to create product');
  const data = await res.json();
  return data.product;
}

export async function createPromotion(promo: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion> {
  const res = await fetch('/api/promotions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(promo),
  });
  if (!res.ok) throw new Error('Failed to create promotion');
  const data = await res.json();
  return data.promotion;
}

export async function submitOrderInquiry(inquiry: Omit<OrderInquiry, 'id' | 'createdAt' | 'status'>): Promise<OrderInquiry> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiry),
  });
  if (!res.ok) throw new Error('Failed to submit order inquiry');
  const data = await res.json();
  return data.inquiry;
}

export async function updateInquiryStatus(id: string, status: 'Pending' | 'Confirmed' | 'Dispatched'): Promise<OrderInquiry> {
  const res = await fetch(`/api/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update inquiry status');
  const data = await res.json();
  return data.inquiry;
}

export async function fetchStats() {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
