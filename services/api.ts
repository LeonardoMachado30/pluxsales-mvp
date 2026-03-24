
import { authService } from './authService';
import { dbService } from './mockDb';
import { Ingredient, Sale, PaymentMethod } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private get headers() {
    const token = localStorage.getItem('plux_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    };
  }

  private get isCloudActive() {
    return !!process.env.REACT_APP_API_URL;
  }

  async login(credentials: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error("Credenciais inválidas");
    const data = await res.json();
    localStorage.setItem('plux_auth_token', data.token);
    return data;
  }

  async getIngredients(): Promise<Ingredient[]> {
    if (!this.isCloudActive) return dbService.getIngredients();
    const res = await fetch(`${API_BASE_URL}/ingredients`, { headers: this.headers });
    return res.json();
  }

  async saveIngredient(data: Ingredient) {
    if (!this.isCloudActive) return dbService.saveIngredient(data);
    const res = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    return res.json();
  }

  async saveProduct(productData: any) {
    if (!this.isCloudActive) return dbService.createProductFull(productData);
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(productData)
    });
    return res.json();
  }

  async processSale(cart: any[], paymentMethod: PaymentMethod, totalRevenue: number, totalCost: number, sectorId: string, sessionId: string, tableName?: string) {
    if (!this.isCloudActive) return dbService.processSale(cart, paymentMethod, undefined, undefined, sectorId, tableName);
    
    const res = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        items: cart.map(i => ({
          product_id: i.product.id,
          name: i.product.name,
          qty: i.qty,
          price_at_sale: i.product.sale_price,
          cost_at_sale: i.product.cmv_total
        })),
        total_revenue: totalRevenue,
        total_cost: totalCost,
        payment_method: paymentMethod,
        sectorId,
        sessionId,
        tableName
      })
    });
    return res.json();
  }

  async getAccountingReport(startDate: string, endDate: string) {
    const res = await fetch(`${API_BASE_URL}/reports/accounting-export?startDate=${startDate}&endDate=${endDate}`, { 
      headers: this.headers 
    });
    return res.json();
  }

  async getCurrentSession() {
    if (!this.isCloudActive) return dbService.getCurrentSession();
    const res = await fetch(`${API_BASE_URL}/register/session/current`, { headers: this.headers });
    if (!res.ok) return null;
    return res.json();
  }

  async openRegister(amount: number) {
    if (!this.isCloudActive) return dbService.openRegister(amount);
    const res = await fetch(`${API_BASE_URL}/register/open`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ openingAmount: amount })
    });
    return res.json();
  }

  async closeRegister(sessionId: string, closingAmount: number) {
    if (!this.isCloudActive) return dbService.closeRegister(closingAmount);
    const res = await fetch(`${API_BASE_URL}/register/close`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ sessionId, closingAmount })
    });
    return res.json();
  }
  
  async getComparativeAnalytics() {
    return {
      weekly: { current_revenue: 15000, prev_revenue: 12000 },
      monthly: { current_revenue: 62000, prev_revenue: 58000 },
      annual: { current_revenue: 740000, prev_revenue: 690000 }
    };
  }
}

export const api = new ApiService();
