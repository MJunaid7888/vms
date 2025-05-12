// API service for VMS backend
const API_BASE_URL = 'https://vms-api-s6lc.onrender.com/api/v1';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  phoneNumber: string;
  role?: string;
}

export interface VisitorData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  hostEmployeeId: string;
  company?: string;
  visitDate: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'security' | 'staff' | 'manager' | 'trainer' | 'host';
  department: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  hostEmployee: string;
  company?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'cancelled';
  visitDate: string;
  qrCode?: string;
  trainingCompleted?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || 'An error occurred';
    throw new Error(errorMessage);
  }

  return data.data;
};

// Authentication API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ userId: string; email: string; firstName: string; lastName: string; role: string; accessToken: string; refreshToken: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData: SignupData): Promise<{ userId: string; email: string; firstName: string; lastName: string; role: string; accessToken: string; refreshToken: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  getProfile: async (token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
};

// Visitor API
export const visitorAPI = {
  scheduleVisit: async (visitorData: VisitorData, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(visitorData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Schedule visit error:', error);
      throw error;
    }
  },

  getVisitorsByHost: async (token: string, status?: string, startDate?: string, endDate?: string): Promise<Visitor[]> => {
    try {
      let url = `${API_BASE_URL}/visitors/host`;
      const params = new URLSearchParams();

      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitors by host error:', error);
      throw error;
    }
  },

  getVisitorById: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor error:', error);
      throw error;
    }
  },

  updateVisitor: async (visitorId: string, visitorData: Partial<VisitorData>, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(visitorData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update visitor error:', error);
      throw error;
    }
  },

  checkInVisitor: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Check in visitor error:', error);
      throw error;
    }
  },

  checkOutVisitor: async (visitorId: string, token: string): Promise<Visitor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}/check-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Check out visitor error:', error);
      throw error;
    }
  },
};

// Training API
export const trainingAPI = {
  getAllTrainings: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/training`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get trainings error:', error);
      throw error;
    }
  },

  submitTraining: async (visitorId: string, trainingId: string, answers: number[], token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId, trainingId, answers }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Submit training error:', error);
      throw error;
    }
  },

  getTrainingStatus: async (visitorId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/status/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get training status error:', error);
      throw error;
    }
  },
};

// Access Control API
export const accessControlAPI = {
  validateQrCode: async (qrData: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/validate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Validate QR code error:', error);
      throw error;
    }
  },

  generateQrCode: async (visitorId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/qr/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Generate QR code error:', error);
      throw error;
    }
  },
};

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

// Employee API
export const employeeAPI = {
  getEmployees: async (token: string): Promise<Employee[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get employees error:', error);
      console.warn('Falling back to mock employee data');

      // Return mock data if the API call fails
      return [
        { id: 'emp1', name: 'John Smith', email: 'john.smith@example.com', department: 'IT' },
        { id: 'emp2', name: 'Jane Doe', email: 'jane.doe@example.com', department: 'HR' },
        { id: 'emp3', name: 'Robert Johnson', email: 'robert.johnson@example.com', department: 'Finance' },
        { id: 'emp4', name: 'Emily Davis', email: 'emily.davis@example.com', department: 'Marketing' },
        { id: 'emp5', name: 'Michael Wilson', email: 'michael.wilson@example.com', department: 'Operations' }
      ];
    }
  },
};

// Analytics API
export const analyticsAPI = {
  getVisitorMetrics: async (token: string, startDate?: string, endDate?: string) => {
    try {
      let url = `${API_BASE_URL}/analytics/visitors`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor metrics error:', error);
      throw error;
    }
  },

  getAccessMetrics: async (token: string, startDate?: string, endDate?: string) => {
    try {
      let url = `${API_BASE_URL}/analytics/access`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get access metrics error:', error);
      throw error;
    }
  },

  getTrainingMetrics: async (token: string, startDate?: string, endDate?: string) => {
    try {
      let url = `${API_BASE_URL}/analytics/training`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get training metrics error:', error);
      throw error;
    }
  },

  getSystemMetrics: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/system`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get system metrics error:', error);
      throw error;
    }
  },
};
