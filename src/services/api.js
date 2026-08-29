import { mockScreenings, mockScreeningDetails, mockIdentities } from '../data/mockData';

export const api = {
  login: async (credentials) => {
    return new Promise(resolve => setTimeout(() => resolve({ token: 'mock-token', user: { name: 'Security Officer' } }), 800));
  },
  
  getDashboardStats: async () => {
    return new Promise(resolve => setTimeout(() => resolve({
      total: 1284,
      low: 1106,
      review: 132,
      high: 46
    }), 500));
  },
  
  getRecentScreenings: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockScreenings), 600));
  },
  
  createScreening: async (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ id: 'demo-001', status: 'created' }), 1500));
  },
  
  getScreening: async (id) => {
    return new Promise(resolve => setTimeout(() => resolve(mockScreeningDetails[id] || mockScreeningDetails['SCR-2026-08124']), 800));
  },
  
  submitQuestion: async (id, answer) => {
    return new Promise(resolve => setTimeout(() => resolve({ 
      success: true, 
      newRiskScore: 38,
      newRiskLevel: 'Medium',
      message: 'Risk assessment updated after additional information.'
    }), 1200));
  },
  
  getIdentity: async (id) => {
    return new Promise(resolve => setTimeout(() => resolve(mockIdentities[0]), 600));
  },
  
  getScreeningHistory: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockScreenings), 700));
  }
};
