const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // OTP Services
  async sendOTP(mobile: string) {
    return this.request('/candidates/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOTP(mobile: string, otp: string) {
    return this.request('/candidates/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  // Candidate Services
  async checkRecord(aadharNumber: string, mobile: string) {
    return this.request('/candidates/check-record', {
      method: 'POST',
      body: JSON.stringify({ aadharNumber, mobile }),
    });
  }

  async registerCandidate(candidateData: any) {
    return this.request('/candidates/register', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
  }

  async searchCandidate(searchParams: { aadhar?: string; mobile?: string; candidateId?: string }) {
    const queryParams = new URLSearchParams();
    
    if (searchParams.aadhar) queryParams.append('aadhar', searchParams.aadhar);
    if (searchParams.mobile) queryParams.append('mobile', searchParams.mobile);
    if (searchParams.candidateId) queryParams.append('candidateId', searchParams.candidateId);

    return this.request(`/candidates/search?${queryParams.toString()}`);
  }

  async getAllCandidates(page = 1, limit = 10, status?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) queryParams.append('status', status);

    return this.request(`/candidates/all?${queryParams.toString()}`);
  }

  async updateCandidateStatus(candidateId: string, status: string) {
    return this.request(`/candidates/${candidateId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();