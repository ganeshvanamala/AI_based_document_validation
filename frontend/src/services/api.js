import { mockScreenings, mockScreeningDetails, mockIdentities } from '../data/mockData';

const BASE_URL = 'http://localhost:8000/api';

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
    try {
      const createRes = await fetch(`${BASE_URL}/screening`, { method: 'POST' });
      const createData = await createRes.json();
      const screeningId = createData.screening_id;

      const formData = new FormData();
      if (data.files && data.files.passport) {
        formData.append('passport', data.files.passport);
      }
      if (data.files && data.files.face) {
        formData.append('face', data.files.face);
      }

      await fetch(`${BASE_URL}/screening/${screeningId}/documents`, {
        method: 'POST',
        body: formData
      });

      return { id: screeningId, status: 'processing_complete' };
    } catch (error) {
      console.error("Failed to connect to real API, falling back to mock...", error);
      return new Promise(resolve => setTimeout(() => resolve({ id: 'demo-001', status: 'created' }), 1500));
    }
  },
  
  getScreening: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/screening/${id}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      
      if (data.ocr_data) {
        const base = JSON.parse(JSON.stringify(mockScreeningDetails['SCR-2026-08124']));
        base.id = data.id;
        base.personName = data.person_name;
        base.status = data.status;
        base.riskScore = data.risk_score;
        base.riskLevel = data.risk_level === 'HIGH' ? 'High' : data.risk_level === 'MEDIUM' ? 'Medium' : 'Low';
        base.recommendation = data.recommendation;
        
        base.ocr = {
          name: data.ocr_data.fields?.name || "Not Found",
          dob: data.ocr_data.fields?.date_of_birth || "Not Found",
          nationality: data.ocr_data.fields?.nationality || "Not Found",
          passportNumber: data.ocr_data.fields?.document_number || "Not Found",
          expiry: data.ocr_data.fields?.expiry_date || "Not Found"
        };
        
        const signals = data.tampering_signals?.signals || [];
        base.tampering = {
          overall: data.tampering_signals?.status === 'SUSPICIOUS' ? 'High' : 'Low',
          photo: 'Low',
          text: signals.some(s => s.type === 'metadata_anomaly' || s.type === 'compression_inconsistency') ? 'High' : 'Low',
          stamp: 'Low',
          metadata: signals.some(s => s.type === 'metadata_anomaly') ? 'High' : 'Low'
        };

        if (data.face_match && data.face_match.status !== "NOT_PROVIDED") {
           // We override the first reason in the mock reasons array to show face match!
           base.reasons = [
              {
                id: 'face-match-result',
                type: data.face_match.status === 'MATCH' ? 'success' : 'danger',
                title: data.face_match.status === 'MATCH' ? 'Face match confirmed' : 'Face mismatch detected',
                description: `Live photo matches document with ${(data.face_match.score).toFixed(1)}% confidence.`,
                confidence: Math.round(data.face_match.score)
              },
              ...base.reasons.filter(r => r.id !== 'face-match')
           ];
           
           if (data.face_match.status === 'MISMATCH') {
               base.riskScore = Math.max(base.riskScore, 95);
               base.riskLevel = 'High';
               base.recommendation = 'Reject - Face Verification Failed';
           }
        }

        return base;
      }
      
      return mockScreeningDetails[id] || mockScreeningDetails['SCR-2026-08124'];
    } catch (error) {
      return mockScreeningDetails[id] || mockScreeningDetails['SCR-2026-08124'];
    }
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
