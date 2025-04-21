import { api } from './api';

// interface SignupResponse {
//   user: {
//     id: string;
//     email: string;
//     full_name: string | null;
//   };
//   has_existing_org: boolean;
//   domain: string;
// }
//todo: create interfaces with the types of user, organization, membership, and onboarding status
interface LoginResponse {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  organization: {
    id: string;
    name: string;
    domain: string;
  } | null;
  membership: {
    status: 'invited' | 'active' | null;
    role: 'member' | 'admin' | null;
  } | null;
  needs_onboarding: boolean;
}
interface SignupResponse {
  id: string;
  email: string;
  full_name: string | null;
  has_existing_org: boolean;
  domain: string;
  organization_status: 'invited' | 'active' | null; // Match MemberStatus enum
}

export interface OnboardingStatusResponse {
  user_id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  membership_status: 'invited' | 'active' | null; // Match MemberStatus enum
  membership_role: 'member' | 'admin' | null; // Match MemberRole enum
  organization_id: string | null;
  organization_name: string | null;
  organization_domain: string | null;
  domain_exists: boolean | null;
  domain: string | null;
}

// interface OrganizationCreate {
//   name: string;
//   domain: string;
//   workspace_url: string;
// }

export const authApi = {
  signup: async (
    email: string,
    full_name: string | null,
    supabase_user_id: string
  ) => {
    try {
      const response = await api.post<SignupResponse>('/auth/register', {
        email,
        full_name,
        supabase_user_id,
      });
      return response.data;
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Registration failed';
      throw new Error(detail);
    }
  },
  login: async (
    email: string,
    supabase_user_id: string
  ): Promise<LoginResponse> => {
    try {
      console.log('Sending login data:', email, supabase_user_id);
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        supabase_user_id,
      });
      return response.data;
    } catch (error: any) {
      console.error('Auth API login error:', error);
      const detail = error.response?.data?.detail || 'Login failed';
      throw new Error(detail);
    }
  },
  sendVerification: async (email: string) => {
    try {
      const response = await api.post('/auth/send-verification', { email });
      return response.data; // Should return { message: "..." }
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || 'Failed to send verification email';
      throw new Error(detail);
    }
  },
  getOnboardingStatus: async (): Promise<OnboardingStatusResponse> => {
    try {
      const response = await api.get<OnboardingStatusResponse>(
        '/auth/onboarding-status'
      );
      return response.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || 'Failed to fetch onboarding status';
      throw new Error(detail);
    }
  },
  updateUser: async (userData: { first_name?: string; last_name?: string }) => {
    try {
      const response = await api.patch('/auth/users/me', userData);
      return response.data; // Returns UserResponse structure
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Failed to update user';
      throw new Error(detail);
    }
  },

  createOrganization: async (formData: FormData) => {
    try {
      console.log('Sending FormData:', Object.fromEntries(formData));
      const response = await api.post('/auth/create-organization', formData, {
        headers: {
          // Don't set Content-Type - it will be set automatically with boundary for FormData
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data) => data],
      });
      return response.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || 'Failed to create organization';
      throw new Error(detail);
    }
  },
  requestAccess: async (orgId: string) => {
    try {
      const response = await api.post(`/auth/request-access/${orgId}`); // Ensure backend route exists
      return response.data;
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Failed to request access';
      throw new Error(detail);
    }
  },
};
