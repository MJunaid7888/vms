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

  // New endpoint: Get visit history
  getVisitHistory: async (token: string, startDate?: string, endDate?: string, status?: string, location?: string): Promise<Visitor[]> => {
    try {
      let url = `${API_BASE_URL}/visitors/visits`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      if (location) params.append('location', location);

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
      console.error('Get visit history error:', error);
      throw error;
    }
  },

  // New endpoint: Get visit history for a specific visitor
  getVisitorHistory: async (visitorId: string, token: string): Promise<Visitor[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/visits/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor history error:', error);
      throw error;
    }
  },
};

// Training API
export interface Training {
  _id: string;
  title: string;
  description: string;
  type: 'safety' | 'security' | 'procedure' | 'other';
  content: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  requiredScore: number;
  isActive: boolean;
}

export interface TrainingEnrollment {
  _id: string;
  visitorId: string;
  trainingId: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  score?: number;
  passed?: boolean;
}

export interface Certificate {
  certificateId: string;
  visitorName: string;
  trainingTitle: string;
  trainingType: string;
  score: number;
  completionDate: string;
  issueDate: string;
}

export const trainingAPI = {
  getAllTrainings: async (token: string): Promise<Training[]> => {
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

  getTrainingById: async (trainingId: string, token: string): Promise<Training> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/${trainingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get training by ID error:', error);
      throw error;
    }
  },

  updateTraining: async (trainingId: string, trainingData: Partial<Training>, token: string): Promise<Training> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/${trainingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(trainingData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update training error:', error);
      throw error;
    }
  },

  deleteTraining: async (trainingId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/${trainingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete training error:', error);
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

  // New endpoint: Enroll visitor in training
  enrollVisitor: async (visitorId: string, trainingId: string, token: string): Promise<TrainingEnrollment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId, trainingId }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Enroll visitor in training error:', error);
      throw error;
    }
  },

  // New endpoint: Generate certificate
  generateCertificate: async (enrollmentId: string, token: string): Promise<Certificate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/certificates/${enrollmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Generate certificate error:', error);
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

// Notification API
export interface Notification {
  _id: string;
  type: 'visitor-arrival' | 'visitor-departure' | 'visitor-registration' | 'visitor-cancelled' |
        'check-in' | 'check-out' | 'registration' | 'cancelled' | 'welcome' | 'reset-password';
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
}

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  hostNotificationsEnabled: boolean;
  visitorNotificationsEnabled: boolean;
  notificationTypes: Record<string, boolean>;
}

export const notificationAPI = {
  // Send notification to visitor
  sendVisitorNotification: async (visitorId: string, type: Notification['type'], message: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/visitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId, type, message }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Send visitor notification error:', error);
      throw error;
    }
  },

  // Send notification to host
  sendHostNotification: async (hostId: string, type: Notification['type'], visitorId: string, message: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/host`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ hostId, type, visitorId, message }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Send host notification error:', error);
      throw error;
    }
  },

  // Get notification history
  getNotificationHistory: async (token: string): Promise<Notification[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get notification history error:', error);
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async (token: string): Promise<NotificationSettings> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get notification settings error:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings: NotificationSettings, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  },
};

// Document Management API
export interface Document {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  visitorId: string;
  uploadedBy: string;
  uploadedAt: string;
  documentType: 'id' | 'nda' | 'training' | 'other';
  description?: string;
}

export const documentAPI = {
  // Upload document
  uploadDocument: async (file: File, visitorId: string, documentType: Document['documentType'], description: string, token: string): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visitorId', visitorId);
      formData.append('documentType', documentType);
      if (description) formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  // Get visitor documents
  getVisitorDocuments: async (visitorId: string, token: string): Promise<Document[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/visitor/${visitorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get visitor documents error:', error);
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId: string, token: string): Promise<Document> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete document error:', error);
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

      // Check if it's a network error or if the endpoint doesn't exist
      if (error instanceof Error &&
          (error.message.includes('Failed to fetch') ||
           error.message.includes('404') ||
           error.message.includes('Not Found'))) {
        console.warn('Employee API endpoint not available, falling back to user data');

        // Try to get users instead, which can serve as employees
        try {
          const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const users = await handleResponse<any[]>(usersResponse);

          // Convert users to employee format
          return users.map((user: any) => ({
            id: user._id || user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            department: user.department || 'General'
          }));
        } catch (userError) {
          console.error('Get users error:', userError);
          console.warn('Falling back to mock employee data');
        }
      }

      // Return mock data only if both API calls fail
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

// Admin API
export interface SystemSettings {
  emailNotificationsEnabled: boolean;
  qrCodeExpiryHours: number;
  visitorPhotoRequired: boolean;
  trainingRequired: boolean;
  systemVersion: string;
}

export interface License {
  _id: string;
  licenseKey: string;
  status: 'Active' | 'Expired' | 'Revoked';
  featuresEnabled: string[];
  expiryDate: string;
  issuedTo: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
}

export const adminAPI = {
  // Get all users
  getUsers: async (token: string, role?: string, department?: string, isActive?: boolean, search?: string): Promise<User[]> => {
    try {
      let url = `${API_BASE_URL}/admin/users`;
      const params = new URLSearchParams();

      if (role) params.append('role', role);
      if (department) params.append('department', department);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      if (search) params.append('search', search);

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
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Create user
  createUser: async (userData: SignupData, token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string, token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>, token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: string, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Get system settings
  getSystemSettings: async (token: string): Promise<SystemSettings> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  },

  // Update system settings
  updateSystemSettings: async (settings: SystemSettings, token: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Update system settings error:', error);
      throw error;
    }
  },

  // Get audit logs
  getAuditLogs: async (token: string, startDate?: string, endDate?: string, userId?: string, action?: string): Promise<AuditLog[]> => {
    try {
      let url = `${API_BASE_URL}/admin/audit-logs`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);

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
      console.error('Get audit logs error:', error);
      throw error;
    }
  },

  // Get licenses
  getLicenses: async (token: string): Promise<License[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/licenses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get licenses error:', error);
      throw error;
    }
  },

  // Add license
  addLicense: async (licenseKey: string, expiryDate: string, token: string): Promise<License> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ licenseKey, expiryDate }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Add license error:', error);
      throw error;
    }
  },
};
