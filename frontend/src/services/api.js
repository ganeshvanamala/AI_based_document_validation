const BASE_URL = 'http://localhost:8000/api';

export const api = {
  login: async (credentials) => {
    return { token: 'auth-token-prod', user: { name: 'Security Officer', role: 'officer' } };
  },
  
  getDashboardStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { total: 0, low: 0, review: 0, high: 0 };
    }
  },
  
  getRecentScreenings: async () => {
    try {
      const res = await fetch(`${BASE_URL}/screenings?limit=5`);
      if (!res.ok) throw new Error('Failed to fetch screenings');
      return await res.json();
    } catch (error) {
      console.error("Error fetching recent screenings:", error);
      return [];
    }
  },
  
  createScreening: async (data) => {
    const createRes = await fetch(`${BASE_URL}/screening`, { method: 'POST' });
    if (!createRes.ok) throw new Error('Failed to create screening case');
    const createData = await createRes.json();
    const screeningId = createData.screening_id;

    const formData = new FormData();
    if (data.files && data.files.passport) {
      formData.append('passport', data.files.passport);
    }
    if (data.files && data.files.face) {
      formData.append('face', data.files.face);
    }

    const uploadRes = await fetch(`${BASE_URL}/screening/${screeningId}/documents`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadRes.ok) throw new Error('Document processing failed');

    return { id: screeningId, status: 'processing_complete' };
  },
  
  getScreening: async (id) => {
    const res = await fetch(`${BASE_URL}/screening/${id}`);
    if (!res.ok) throw new Error(`Screening ${id} not found`);
    const data = await res.json();
    return data;
  },
  
  submitQuestion: async (id, answer) => {
    const res = await fetch(`${BASE_URL}/screening/${id}/questions/q1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: 'q1', answer: answer })
    });
    if (!res.ok) throw new Error('Failed to submit question');
    return await res.json();
  },
  
  getIdentity: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/identity/${id}`);
      if (!res.ok) throw new Error('Failed to fetch identity');
      return await res.json();
    } catch (error) {
      console.error("Error fetching identity:", error);
      return { id, name: id, dob: 'N/A', nationality: 'Indian', status: 'Active' };
    }
  },
  
  getScreeningHistory: async () => {
    try {
      const res = await fetch(`${BASE_URL}/screenings`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return await res.json();
    } catch (error) {
      console.error("Error fetching screening history:", error);
      return [];
    }
  }
};
